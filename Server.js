const express = require("express");
const cors = require("cors");
const multer = require("multer");
const multerS3 = require("multer-s3");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// --- AWS SDK v3 Imports ---
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { 
    DynamoDBDocumentClient, 
    PutCommand, 
    ScanCommand, 
    DeleteCommand, 
    GetCommand,
    BatchWriteCommand
} = require("@aws-sdk/lib-dynamodb");
const { S3Client } = require("@aws-sdk/client-s3");

const app = express();

// MIDDLEWARE
app.use(cors({
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
}));

// Body parsers come right after cors.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- AWS SDK v3 Client Configuration ---
const REGION = process.env.AWS_REGION;
const s3Client = new S3Client({ region: REGION });
const dbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(dbClient);

// TABLE NAMES from .env
const {
    DYNAMODB_CONTACT_TABLE: CONTACT_TABLE,
    DYNAMODB_DEALER_TABLE: DEALER_TABLE,
    DYNAMODB_PRODUCT_TABLE: PRODUCT_TABLE,
    DYNAMODB_PRODUCT_SURVEY_TABLE: PRODUCT_SURVEY_TABLE,
    DYNAMODB_MEDIA_QUERIES_TABLE: MEDIA_QUERIES_TABLE,
    DYNAMODB_ADMIN_TABLE: ADMIN_TABLE,
    DYNAMODB_BUSINESS_ORDERS_TABLE: BUSINESS_ORDERS_TABLE,
     DYNAMODB_VENDOR_PRODUCT_TABLE: VENDOR_PRODUCT_TABLE,
    S3_BUCKET_NAME,
     S3_VENDOR_BUCKET_NAME
} = process.env;

// --- MULTER-S3 CONFIG with v3 Client ---
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: S3_BUCKET_NAME,
    //acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const fileName = `products/${Date.now()}_${file.originalname}`;
      cb(null, fileName);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// --- (NEW) MULTER-S3 CONFIG for VENDORS ---
const vendorUpload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: S3_VENDOR_BUCKET_NAME, // Use the new vendor bucket
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            const fileName = `${Date.now()}_${file.originalname}`;
            cb(null, fileName);
        },
    }),
});

// AUTHENTICATION MIDDLEWARE
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ================= ADMIN ROUTES =================

// --- ADMIN: LOGIN ---
app.post("/api/admin/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password are required" });

    if (username === process.env.SUPER_ADMIN_USERNAME && password === process.env.SUPER_ADMIN_PASSWORD) {
        const token = jwt.sign({ username: username, role: 'superadmin' }, process.env.JWT_SECRET, { expiresIn: "8h" });
        return res.json({ success: true, message: "Super admin login successful", token, user: { name: 'Super Admin' } });
    }

    try {
        const command = new GetCommand({ TableName: ADMIN_TABLE, Key: { username: username.toLowerCase() } });
        const { Item } = await docClient.send(command);
        if (!Item || !(await bcrypt.compare(password, Item.password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jwt.sign({ username: Item.username, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: "8h" });
        res.json({ success: true, message: "Login successful", token, user: { name: Item.username } });
    } catch (error) {
        res.status(500).json({ success: false, error: "Login failed" });
    }
});

// --- ADMIN: ADD USER ---
app.post("/api/admin/add-user", authenticateToken, async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password are required" });
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const command = new PutCommand({
            TableName: ADMIN_TABLE,
            Item: { username: username.toLowerCase(), password: hashedPassword },
            ConditionExpression: "attribute_not_exists(username)",
        });
        await docClient.send(command);
        res.status(201).json({ success: true, message: `Admin user '${username}' created.` });
    } catch (error) {
        if (error.name === 'ConditionalCheckFailedException') {
            return res.status(409).json({ success: false, error: "Username already exists." });
        }
        res.status(500).json({ success: false, error: "Failed to create admin user." });
    }
});

// --- ADMIN: ADD PRODUCT ---
app.post("/api/admin/products", authenticateToken, upload.single("image"), async (req, res) => {
    try {
        const { name, price, description, category, brand } = req.body;
        if (!name || !price) return res.status(400).json({ success: false, error: "Product name and price are required." });
        const priceNumber = Number(price);
        if (isNaN(priceNumber)) return res.status(400).json({ success: false, error: "Invalid price." });
        if (!req.file || !req.file.location) return res.status(400).json({ success: false, error: "Image upload failed." });
        
        const productItem = {
            productId: Date.now().toString(), name, price: priceNumber,
            description: description || "", category: category || "", brand: brand || "",
            imageUrl: req.file.location, createdAt: new Date().toISOString(),
        };
        
        const command = new PutCommand({ TableName: PRODUCT_TABLE, Item: productItem });
        await docClient.send(command);
        res.status(201).json({ success: true, message: "Product added successfully", product: productItem });
    } catch (error) {
        console.error("❌ Error adding product:", error);
        res.status(500).json({ success: false, error: error.message || "Failed to add product." });
    }
});

// --- ADMIN: VIEW TABLES ---
const createScanHandler = (tableName) => async (req, res) => {
    try {
        const command = new ScanCommand({ TableName: tableName });
        const { Items } = await docClient.send(command);
        res.json({ success: true, data: Items || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

app.get("/api/admin/contacts", authenticateToken, createScanHandler(CONTACT_TABLE));
app.get("/api/admin/dealers", authenticateToken, createScanHandler(DEALER_TABLE));
app.get("/api/admin/media-queries", authenticateToken, createScanHandler(MEDIA_QUERIES_TABLE));
app.get("/api/admin/product-surveys", authenticateToken, createScanHandler(PRODUCT_SURVEY_TABLE));
app.get("/api/admin/products", authenticateToken, createScanHandler(PRODUCT_TABLE));
app.get("/api/admin/admins", authenticateToken, async (req, res) => {
    try {
        const command = new ScanCommand({ TableName: ADMIN_TABLE });
        const { Items } = await docClient.send(command);
        const sanitizedAdmins = (Items || []).map(admin => {
            delete admin.password;
            return admin;
        });
        res.json({ success: true, data: sanitizedAdmins });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add this new route to server.js batch delete

app.post("/api/admin/batch-delete", authenticateToken, async (req, res) => {
    const { tableName, ids } = req.body;

    if (!tableName || !ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, error: "Table name and a non-empty array of IDs are required." });
    }

    // A map to determine the primary key for each table
    const keyMap = {
        'Products': 'productId',
        'vendorproduct': 'productId',
        'Admins': 'username',
        'Dealers': 'dealerId',
        // All other tables below use 'id' as the primary key
    };
    const primaryKey = keyMap[tableName] || 'id';

    // A map to get the correct table name from the display name
    const tableMap = {
        'Products': PRODUCT_TABLE,
        'Dealers': DEALER_TABLE,
        'Admins': ADMIN_TABLE,
        'Contact Messages': CONTACT_TABLE,
        'Media Queries': MEDIA_QUERIES_TABLE,
        'Product Surveys': PRODUCT_SURVEY_TABLE,
    };
    const dynamoTableName = tableMap[tableName];

    if (!dynamoTableName) {
        return res.status(400).json({ success: false, error: "Invalid table name specified." });
    }

    // Format the requests for BatchWriteCommand
    const deleteRequests = ids.map(id => ({
        DeleteRequest: {
            Key: { [primaryKey]: id },
        },
    }));

    try {
        const command = new BatchWriteCommand({
            RequestItems: {
                [dynamoTableName]: deleteRequests,
            },
        });
        await docClient.send(command);
        res.json({ success: true, message: `${ids.length} items deleted successfully.` });
    } catch (error) {
        console.error("Batch delete error:", error);
        res.status(500).json({ success: false, error: "Failed to delete items." });
    }
});
// --- ADMIN: DELETE & UPDATE ROUTES ---
const createDeleteHandler = (tableName, keyName) => async (req, res) => {
    try {
        const command = new DeleteCommand({ TableName: tableName, Key: { [keyName]: req.params[keyName] } });
        await docClient.send(command);
        res.json({ success: true, message: "Item deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const createUpdateHandler = (tableName, keyName) => async (req, res) => {
    try {
        const updatedItem = { ...req.body, [keyName]: req.params[keyName] };
        const command = new PutCommand({ TableName: tableName, Item: updatedItem });
        await docClient.send(command);
        res.json({ success: true, message: "Item updated successfully." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Contacts
app.delete("/api/admin/contacts/:id", authenticateToken, createDeleteHandler(CONTACT_TABLE, "id"));
app.put("/api/admin/contacts/:id", authenticateToken, createUpdateHandler(CONTACT_TABLE, "id"));
// Dealers
app.delete("/api/admin/dealers/:dealerId", authenticateToken, createDeleteHandler(DEALER_TABLE, "dealerId"));
app.put("/api/admin/dealers/:dealerId", authenticateToken, createUpdateHandler(DEALER_TABLE, "dealerId"));
// Media Queries
app.delete("/api/admin/media-queries/:id", authenticateToken, createDeleteHandler(MEDIA_QUERIES_TABLE, "id"));
app.put("/api/admin/media-queries/:id", authenticateToken, createUpdateHandler(MEDIA_QUERIES_TABLE, "id"));
// Product Surveys
app.delete("/api/admin/product-surveys/:id", authenticateToken, createDeleteHandler(PRODUCT_SURVEY_TABLE, "id"));
app.put("/api/admin/product-surveys/:id", authenticateToken, createUpdateHandler(PRODUCT_SURVEY_TABLE, "id"));
// Admins
app.delete("/api/admin/admins/:username", authenticateToken, createDeleteHandler(ADMIN_TABLE, "username"));
// Products
app.delete("/api/admin/products/:productId", authenticateToken, createDeleteHandler(PRODUCT_TABLE, "productId"));
app.put("/api/admin/products/:productId", authenticateToken, createUpdateHandler(PRODUCT_TABLE, "productId"));


// ================= PUBLIC ROUTES =================
// Add this new route in server.js, right after your GET /products route

// --- GET SINGLE PRODUCT BY ID ---
// In server.js, replace your existing "/products/:productId" route with this one.

app.get("/api/products/:productId", async (req, res) => {
    try {
        const { productId } = req.params;

        // Helper function to format the DB item for the frontend
        const formatProduct = (item) => ({
            id: item.productId,
            name: item.name,
            price: item.price,
            img: item.imageUrl,
            category: item.category,
            brand: item.brand,
            description: item.description
        });

        // 1. First, try to get the product from the main (admin) product table
        const adminProductCommand = new GetCommand({
            TableName: PRODUCT_TABLE,
            Key: { productId },
        });
        let { Item } = await docClient.send(adminProductCommand);

        // 2. If it's not found in the admin table, try the vendor table
        if (!Item) {
            const vendorProductCommand = new GetCommand({
                TableName: VENDOR_PRODUCT_TABLE,
                Key: { productId },
            });
            const vendorResult = await docClient.send(vendorProductCommand);
            Item = vendorResult.Item; // This will either be the item or undefined
        }

        // 3. If an item was found in either table, format and return it
        if (Item) {
            res.json({ success: true, product: formatProduct(Item) });
        } else {
            // 4. If not found in either, return a 404 error
            res.status(404).json({ success: false, error: "Product not found" });
        }
    } catch (error) {
        console.error("Error fetching single product:", error);
        res.status(500).json({ success: false, error: "Failed to fetch product" });
    }
});
// --- GET ALL PRODUCTS ---
// app.get("/products", async (req, res) => {
//     try {
//         const command = new ScanCommand({ TableName: PRODUCT_TABLE });
//         const { Items } = await docClient.send(command);
//         const products = (Items || []).map(item => ({
//             id: item.productId, name: item.name, price: item.price, img: item.imageUrl,
//             category: item.category, brand: item.brand, description: item.description,
//         }));
//         res.json({ success: true, items: products });
//     } catch (error) {
//         res.status(500).json({ success: false, error: "Failed to fetch products" });
//     }
// });

// In server.js, replace your existing "/products" route with this one.

app.get("/api/products", async (req, res) => {
    try {
        // 1. Create scan commands for both tables
        const adminProductsCommand = new ScanCommand({ TableName: PRODUCT_TABLE });
        const vendorProductsCommand = new ScanCommand({ TableName: VENDOR_PRODUCT_TABLE });

        // 2. Run both scans in parallel for better performance
        const [adminProductsResult, vendorProductsResult] = await Promise.all([
            docClient.send(adminProductsCommand),
            docClient.send(vendorProductsCommand)
        ]);

        // 3. Combine the items from both results into a single array
        const allItems = [
            ...(adminProductsResult.Items || []),
            ...(vendorProductsResult.Items || [])
        ];

        // 4. Map the combined list into the format your frontend expects
        const formattedProducts = allItems.map(item => ({
            id: item.productId,
            name: item.name,
            price: item.price,
            img: item.imageUrl,
            category: item.category,
            brand: item.brand,
            description: item.description,
        }));

        res.json({ success: true, items: formattedProducts });

    } catch (error) {
        console.error("❌ Error fetching all products:", error);
        res.status(500).json({ success: false, error: "Failed to fetch products" });
    }
});
// --- POST ROUTES ---
app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ success: false, error: "Missing required fields" });
    const item = { id: Date.now().toString(), name, email, message, createdAt: new Date().toISOString() };
    const command = new PutCommand({ TableName: CONTACT_TABLE, Item: item });
    try {
        await docClient.send(command);
        res.json({ success: true, message: "Message saved", data: item });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to save message" });
    }
});

app.post("/api/business-orders", async (req, res) => {
    const { name, email, phone, company, selectedProducts, shippingAddress, billingAddress, total } = req.body;
    if (!name || !email || !phone || !selectedProducts) return res.status(400).json({ success: false, error: "Missing required fields" });
    const item = { id: Date.now().toString(), name, email, phone, company: company || "", selectedProducts, shippingAddress, billingAddress, total, createdAt: new Date().toISOString() };
    const command = new PutCommand({ TableName: BUSINESS_ORDERS_TABLE, Item: item });
    try {
        await docClient.send(command);
        res.json({ success: true, message: "Business order saved", data: item });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to save business order" });
    }
});

app.post("/api/product-survey", async (req, res) => {
    // Destructure `productName` from the request body to match the frontend
    const { productName, rating, feedback } = req.body;

    // Validate that required fields are present
    if (!productName || !rating) {
        return res.status(400).json({ success: false, message: "Missing required fields: productName and rating are required." });
    }

    // Prepare the item to be saved in DynamoDB
    const item = {
        id: Date.now().toString(), // Using timestamp as a simple unique ID
        productName: productName,  // Using productName from the request
        rating: rating,
        feedback: feedback || "", // Use feedback if provided, otherwise empty string
        createdAt: new Date().toISOString(),
    };

    // Create the DynamoDB PutCommand
    const command = new PutCommand({
        TableName: PRODUCT_SURVEY_TABLE,
        Item: item,
    });

    try {
        // Execute the command to save the item
        await docClient.send(command);
        console.log("Survey saved successfully:", item);
        res.status(201).json({ success: true, message: "Survey saved successfully" });
    } catch (error) {
        console.error("Failed to save survey to DynamoDB:", error);
        res.status(500).json({ success: false, message: "Internal server error: Failed to save survey." });
    }
});


app.post("/api/media-queries", async (req, res) => {
    const { name, email, query } = req.body;
    if (!name || !email || !query) return res.status(400).json({ success: false, error: "Missing required fields" });
    const item = { id: Date.now().toString(), name, email, query, createdAt: new Date().toISOString() };
    const command = new PutCommand({ TableName: MEDIA_QUERIES_TABLE, Item: item });
    try {
        await docClient.send(command);
        res.json({ success: true, message: "Media query saved" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to save media query" });
    }
});

app.post("/api/dealers", async (req, res) => {
    const { name, email, phone, company, address } = req.body;
    if (!name || !email || !phone) return res.status(400).json({ success: false, error: "Missing required fields" });
    const item = { dealerId: Date.now().toString(), name, email, phone, company: company || "", address: address || "", createdAt: new Date().toISOString() };
    const command = new PutCommand({ TableName: DEALER_TABLE, Item: item });
    try {
        await docClient.send(command);
        res.json({ success: true, message: "Dealer registered successfully", dealerId: item.dealerId });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to register dealer" });
    }
});

// Add this to server.js

// In server.js, replace the old /dealers/login route

app.post("/api/dealers/login", async (req, res) => {
    const { email, phone } = req.body; // Expect email and phone

    if (!email || !phone) {
        return res.status(400).json({ success: false, error: "Email and Phone Number are required." });
    }

    try {
        // Find the dealer by email
        const params = {
            TableName: DEALER_TABLE,
            FilterExpression: "email = :email",
            ExpressionAttributeValues: { ":email": email.toLowerCase() }
        };

        const { Items } = await docClient.send(new ScanCommand(params));

        if (Items.length === 0) {
            return res.status(404).json({ success: false, error: "No dealer found with that email." });
        }

        const dealer = Items[0];

        // Now, check if the provided phone number matches the one in the database
        if (dealer.phone === phone) {
            // Successful login, return the dealerId to be stored on the client
            res.json({ success: true, message: "Login successful!", dealerId: dealer.dealerId });
        } else {
            // Incorrect credentials
            res.status(401).json({ success: false, error: "Invalid email or phone number." });
        }

    } catch (error) {
        console.error("Dealer login error:", error);
        res.status(500).json({ success: false, error: "Server error during login." });
    }
});
// Add this to your server.js file

app.get("/api/dealers/:dealerId", async (req, res) => {
    try {
        const { dealerId } = req.params;
        const command = new GetCommand({
            TableName: DEALER_TABLE,
            Key: { dealerId },
        });

        const { Item } = await docClient.send(command);

        if (Item) {
            res.json({ success: true, dealer: Item });
        } else {
            res.status(404).json({ success: false, error: "Dealer not found" });
        }
    } catch (error) {
        console.error("Error fetching dealer details:", error);
        res.status(500).json({ success: false, error: "Failed to fetch dealer details" });
    }
});

// --- (NEW) VENDOR: ADD PRODUCT ---
app.post("/api/dealer/products", vendorUpload.single("image"), async (req, res) => {
    try {
        const { dealerId, name, price, description, category, brand } = req.body;
        if (!dealerId || !name || !price || !req.file) {
            return res.status(400).json({ success: false, error: "Missing required fields." });
        }
        
        const productItem = {
            productId: Date.now().toString(),
            dealerId, name, brand, category, description,
            price: Number(price),
            imageUrl: req.file.location, // The URL from S3
            createdAt: new Date().toISOString(),
        };

        // Save to the new vendor product table
        const command = new PutCommand({ TableName: VENDOR_PRODUCT_TABLE, Item: productItem });
        await docClient.send(command);

        res.status(201).json({ success: true, message: "Product uploaded successfully by dealer", product: productItem });

    } catch (error) {
        console.error("❌ Error adding vendor product:", error);
        res.status(500).json({ success: false, error: "Failed to upload product." });
    }
})

// Add these three routes to server.js

// --- GET ALL PRODUCTS FOR A SPECIFIC DEALER ---
app.get("/api/dealer/products/:dealerId", async (req, res) => {
    try {
        const { dealerId } = req.params;
        const command = new ScanCommand({
            TableName: VENDOR_PRODUCT_TABLE,
            FilterExpression: "dealerId = :dealerId",
            ExpressionAttributeValues: { ":dealerId": dealerId },
        });

        const { Items } = await docClient.send(command);
        res.json({ success: true, products: Items || [] });

    } catch (error) {
        console.error("Error fetching dealer products:", error);
        res.status(500).json({ success: false, error: "Failed to fetch products." });
    }
});

// --- DELETE A VENDOR'S PRODUCT ---
app.delete("/api/dealer/products/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        // In a real app, you'd also check if the logged-in dealer owns this product
        const command = new DeleteCommand({
            TableName: VENDOR_PRODUCT_TABLE,
            Key: { productId },
        });

        await docClient.send(command);
        res.json({ success: true, message: "Product deleted successfully." });

    } catch (error) {
        console.error("Error deleting dealer product:", error);
        res.status(500).json({ success: false, error: "Failed to delete product." });
    }
});

// --- UPDATE A VENDOR'S PRODUCT ---
// In server.js, replace the existing PUT /dealer/products/:productId route

app.put("/api/dealer/products/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        const updatedProductData = req.body;

        // --- (FIX) ---
        // Ensure price is converted to a Number before saving
        if (updatedProductData.price !== undefined) {
            const priceNumber = Number(updatedProductData.price);
            if (isNaN(priceNumber)) {
                // If the price is not a valid number, reject the request
                return res.status(400).json({ success: false, error: "Invalid price format." });
            }
            updatedProductData.price = priceNumber;
        }
        // ---------------

        // Ensure the primary key is correctly set
        updatedProductData.productId = productId;
        
        const command = new PutCommand({
            TableName: VENDOR_PRODUCT_TABLE,
            Item: updatedProductData,
        });

        await docClient.send(command);
        res.json({ success: true, message: "Product updated successfully.", product: updatedProductData });

    } catch (error) {
        console.error("Error updating dealer product:", error);
        res.status(500).json({ success: false, error: "Failed to update product." });
    }
});
// ================= START SERVER =================
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));