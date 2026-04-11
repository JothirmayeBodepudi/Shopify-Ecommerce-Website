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
  BatchWriteCommand,
  UpdateCommand   // ✅ ADD THIS LINE
} = require("@aws-sdk/lib-dynamodb");

const { S3Client } = require("@aws-sdk/client-s3");



const app = express();

const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

// SES is usually in the same region as your DynamoDB
const sesClient = new SESClient({ region: "eu-north-1" });
// MIDDLEWARE
app.use(cors({
  origin: ["http://localhost:3000", "https://main.d20yxa1qcjiie4.amplifyapp.com"],
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
    DYNAMODB_ORDERS_TABLE: ORDERS_TABLE,

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

const authenticateVendor = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err || user.role !== "vendor") {
      return res.status(403).json({ error: "Vendor access required" });
    }
    req.vendorId = user.dealerId;
    next();
  });
};


// ================= ADMIN ROUTES =================

// =============================================================================
//                                ADMIN ROUTES
// =============================================================================

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

// --- ADMIN: VIEW ALL ORDERS ---
app.get("/api/admin/orders", authenticateToken, async (req, res) => {
    try {
        const command = new ScanCommand({ TableName: ORDERS_TABLE });
        const { Items } = await docClient.send(command);
        res.json({ success: true, data: Items || [] });
    } catch (error) {
        console.error("❌ Fetch admin orders failed:", error);
        res.status(500).json({ success: false, error: "Failed to fetch orders" });
    }
});
// --- ADMIN: DELETE ORDER ---
app.delete("/api/admin/orders/:orderId", authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.params;
        await docClient.send(new DeleteCommand({ 
            TableName: ORDERS_TABLE, 
            Key: { orderId } 
        }));
        res.json({ success: true, message: "Order deleted successfully." });
    } catch (error) {
        console.error("❌ Delete order failed:", error);
        res.status(500).json({ error: "Failed to delete order." });
    }
});

// --- ADMIN: EDIT/UPDATE ORDER ---
app.put("/api/admin/orders/:orderId", authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.params;
        
        // Grab all the updated fields from the frontend request
        // and ensure the orderId remains the exact same as the URL parameter
        const updatedOrder = { ...req.body, orderId };

        await docClient.send(new PutCommand({ 
            TableName: ORDERS_TABLE, 
            Item: updatedOrder 
        }));
        
        res.json({ success: true, message: "Order updated successfully." });
    } catch (error) {
        console.error("❌ Update order failed:", error);
        res.status(500).json({ error: "Failed to update order details." });
    }
});
// --- ADMIN: REAL-TIME ANALYTICS ---
app.get("/api/admin/dashboard-stats", authenticateToken, async (req, res) => {
    try {
        // 1. Fetch live data from your tables
        const [ordersRes, contactsRes] = await Promise.all([
            docClient.send(new ScanCommand({ TableName: ORDERS_TABLE })),
            docClient.send(new ScanCommand({ TableName: CONTACT_TABLE }))
        ]);

        const allOrders = ordersRes.Items || [];
        const allContacts = contactsRes.Items || [];
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        // 2. Aggregate Real Statistics
        // Revenue is the sum of totalAmount from all entries in the Orders table
        const totalRevenue = allOrders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
        
        // New Orders (New Inquiries label) counts orders placed today
        const todayOrdersCount = allOrders.filter(order => order.createdAt && order.createdAt.startsWith(today)).length;
        
        // Pending Orders are those with "Processing" status
        const pendingOrdersCount = allOrders.filter(order => order.status === "Processing").length;

        // 3. Prepare Chart Data (Grouped by Date for the last 7 days)
        const statsMap = {};
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        // Initialize 7-day window with 0s to avoid gaps in the graph
        last7Days.forEach(date => {
            statsMap[date] = { date, orders: 0, inquiries: 0 };
        });

        // Fill map with real database counts for the line chart
        allOrders.forEach(order => {
            const date = order.createdAt?.split('T')[0];
            if (statsMap[date]) statsMap[date].orders++;
        });
        
        // Tracking actual Contact Message inquiries for the second line
        allContacts.forEach(contact => {
            const date = contact.createdAt?.split('T')[0];
            if (statsMap[date]) statsMap[date].inquiries++;
        });

        res.json({
            success: true,
            stats: { 
                totalRevenue, 
                newOrdersToday: todayOrdersCount, 
                pendingOrders: pendingOrdersCount 
            },
            chartData: Object.values(statsMap)
        });
    } catch (error) {
        console.error("❌ Stats fetch failed:", error);
        res.status(500).json({ success: false, error: "Failed to fetch dashboard data" });
    }
});

// --- ADMIN: UPDATE ORDER STATUS (SYSTEM PRODUCTS ONLY) ---
app.put("/api/admin/orders/:orderId/status", authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const { Item: order } = await docClient.send(new GetCommand({ 
            TableName: ORDERS_TABLE, 
            Key: { orderId } 
        }));

        if (!order) return res.status(404).json({ error: "Order not found" });

        // CHECK OWNERSHIP: Does this order contain an item with NO dealerId (Admin product)?
        const isSystemOrder = order.items.some(item => item.dealerId === null || item.dealerId === undefined);

        if (!isSystemOrder) {
            return res.status(403).json({ 
                success: false, 
                error: "Access Denied: This order belongs to a third-party vendor." 
            });
        }

        await docClient.send(new UpdateCommand({
            TableName: ORDERS_TABLE,
            Key: { orderId },
            UpdateExpression: "SET #s = :s", 
            ExpressionAttributeNames: { "#s": "status" },
            ExpressionAttributeValues: { ":s": status }
        }));

        res.json({ success: true, message: "Admin order status updated." });
    } catch (error) {
        res.status(500).json({ error: "Failed to update status" });
    }
});
// --- ADMIN: PRODUCT & USER MANAGEMENT ---
app.post("/api/admin/add-user", authenticateToken, async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password are required" });
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await docClient.send(new PutCommand({
            TableName: ADMIN_TABLE,
            Item: { username: username.toLowerCase(), password: hashedPassword },
            ConditionExpression: "attribute_not_exists(username)",
        }));
        res.status(201).json({ success: true, message: `Admin user '${username}' created.` });
    } catch (error) {
        if (error.name === 'ConditionalCheckFailedException') return res.status(409).json({ error: "Username already exists." });
        res.status(500).json({ error: "Failed to create admin user." });
    }
});

app.post("/api/admin/products", authenticateToken, upload.single("image"), async (req, res) => {
    try {
        const { name, price, description, category, brand } = req.body;
        if (!name || !price || !req.file) return res.status(400).json({ error: "Missing required fields." });
        
        const productItem = {
            productId: Date.now().toString(), name, price: Number(price),
            description: description || "", category: category || "", brand: brand || "",
            imageUrl: req.file.location, createdAt: new Date().toISOString(),
        };
        await docClient.send(new PutCommand({ TableName: PRODUCT_TABLE, Item: productItem }));
        res.status(201).json({ success: true, product: productItem });
    } catch (error) {
        res.status(500).json({ error: "Failed to add product." });
    }
});

// --- ADMIN: BATCH DELETE ---
app.post("/api/admin/batch-delete", authenticateToken, async (req, res) => {
    const { tableName, ids } = req.body;
    if (!tableName || !ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "Table name and a non-empty array of IDs are required." });
    }

    // ✅ ADDED 'Orders': 'orderId' to the key map
    const keyMap = { 
        'Products': 'productId', 
        'vendorproduct': 'productId', 
        'Admins': 'username', 
        'Dealers': 'dealerId',
        'Orders': 'orderId' 
    };
    const primaryKey = keyMap[tableName] || 'id';

    // ✅ ADDED 'Orders': ORDERS_TABLE to the table map
    const tableMap = {
        'Products': PRODUCT_TABLE, 
        'Dealers': DEALER_TABLE, 
        'Admins': ADMIN_TABLE,
        'Contact Messages': CONTACT_TABLE, 
        'Media Queries': MEDIA_QUERIES_TABLE, 
        'Product Surveys': PRODUCT_SURVEY_TABLE,
        'Orders': ORDERS_TABLE
    };
    
    const dynamoTableName = tableMap[tableName];
    if (!dynamoTableName) return res.status(400).json({ error: "Invalid table name specified." });

    // Note: DynamoDB BatchWriteCommand can only delete 25 items at a time. 
    // If you plan to delete more than 25 orders at once, you will need to chunk the array.
    const deleteRequests = ids.map(id => ({ DeleteRequest: { Key: { [primaryKey]: id } } }));

    try {
        await docClient.send(new BatchWriteCommand({ RequestItems: { [dynamoTableName]: deleteRequests } }));
        res.json({ success: true, message: `${ids.length} items deleted successfully.` });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete items." });
    }
});
// --- ADMIN: GENERIC CRUD HANDLERS ---
const createScanHandler = (tableName) => async (req, res) => {
    try {
        const { Items } = await docClient.send(new ScanCommand({ TableName: tableName }));
        res.json({ success: true, data: Items || [] });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

const createDeleteHandler = (tableName, keyName) => async (req, res) => {
    try {
        await docClient.send(new DeleteCommand({ TableName: tableName, Key: { [keyName]: req.params[keyName] } }));
        res.json({ success: true, message: "Item deleted successfully." });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

const createUpdateHandler = (tableName, keyName) => async (req, res) => {
    try {
        const updatedItem = { ...req.body, [keyName]: req.params[keyName] };
        await docClient.send(new PutCommand({ TableName: tableName, Item: updatedItem }));
        res.json({ success: true, message: "Item updated successfully." });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

app.get("/api/admin/contacts", authenticateToken, createScanHandler(CONTACT_TABLE));
app.get("/api/admin/dealers", authenticateToken, createScanHandler(DEALER_TABLE));
app.get("/api/admin/media-queries", authenticateToken, createScanHandler(MEDIA_QUERIES_TABLE));
app.get("/api/admin/product-surveys", authenticateToken, createScanHandler(PRODUCT_SURVEY_TABLE));
app.get("/api/admin/products", authenticateToken, createScanHandler(PRODUCT_TABLE));
app.get("/api/admin/admins", authenticateToken, async (req, res) => {
    try {
        const { Items } = await docClient.send(new ScanCommand({ TableName: ADMIN_TABLE }));
        const sanitized = (Items || []).map(({password, ...rest}) => rest);
        res.json({ success: true, data: sanitized });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete("/api/admin/contacts/:id", authenticateToken, createDeleteHandler(CONTACT_TABLE, "id"));
app.put("/api/admin/contacts/:id", authenticateToken, createUpdateHandler(CONTACT_TABLE, "id"));
app.delete("/api/admin/dealers/:dealerId", authenticateToken, createDeleteHandler(DEALER_TABLE, "dealerId"));
app.put("/api/admin/dealers/:dealerId", authenticateToken, createUpdateHandler(DEALER_TABLE, "dealerId"));
app.delete("/api/admin/media-queries/:id", authenticateToken, createDeleteHandler(MEDIA_QUERIES_TABLE, "id"));
app.put("/api/admin/media-queries/:id", authenticateToken, createUpdateHandler(MEDIA_QUERIES_TABLE, "id"));
app.delete("/api/admin/product-surveys/:id", authenticateToken, createDeleteHandler(PRODUCT_SURVEY_TABLE, "id"));
app.put("/api/admin/product-surveys/:id", authenticateToken, createUpdateHandler(PRODUCT_SURVEY_TABLE, "id"));
app.delete("/api/admin/admins/:username", authenticateToken, createDeleteHandler(ADMIN_TABLE, "username"));
app.delete("/api/admin/products/:productId", authenticateToken, createDeleteHandler(PRODUCT_TABLE, "productId"));
app.put("/api/admin/products/:productId", authenticateToken, createUpdateHandler(PRODUCT_TABLE, "productId"));
// =============================================================================
//                               VENDOR / DEALER ROUTES
// =============================================================================

app.post("/api/dealers", async (req, res) => {
    const { name, email, phone, company, address } = req.body;
    if (!name || !email || !phone) return res.status(400).json({ error: "Missing required fields" });
    const item = { dealerId: Date.now().toString(), name, email, phone, company: company || "", address: address || "", createdAt: new Date().toISOString() };
    try {
        await docClient.send(new PutCommand({ TableName: DEALER_TABLE, Item: item }));
        res.json({ success: true, dealerId: item.dealerId });
    } catch (error) { res.status(500).json({ error: "Failed to register dealer" }); }
});

app.post("/api/dealers/login", async (req, res) => {
    const { email, phone } = req.body;
    if (!email || !phone) return res.status(400).json({ error: "Email and Phone are required." });
    try {
        const { Items } = await docClient.send(new ScanCommand({
            TableName: DEALER_TABLE,
            FilterExpression: "email = :email",
            ExpressionAttributeValues: { ":email": email.toLowerCase() }
        }));
        if (Items.length === 0 || Items[0].phone !== phone) return res.status(401).json({ error: "Invalid credentials." });
        res.json({ success: true, dealerId: Items[0].dealerId });
    } catch (error) { res.status(500).json({ error: "Server error during login." }); }
});

app.get("/api/dealers/:dealerId", async (req, res) => {
    try {
        const { Item } = await docClient.send(new GetCommand({ TableName: DEALER_TABLE, Key: { dealerId: req.params.dealerId } }));
        Item ? res.json({ success: true, dealer: Item }) : res.status(404).json({ error: "Dealer not found" });
    } catch (error) { res.status(500).json({ error: "Failed to fetch dealer" }); }
});

// --- VENDOR PRODUCT MANAGEMENT ---
app.post("/api/dealer/products", vendorUpload.single("image"), async (req, res) => {
    try {
        const { dealerId, name, price, description, category, brand } = req.body;
        if (!dealerId || !name || !price || !req.file) return res.status(400).json({ error: "Missing required fields." });
        const productItem = {
            productId: Date.now().toString(), dealerId, name, brand, category, description,
            price: Number(price), imageUrl: req.file.location, createdAt: new Date().toISOString(),
        };
        await docClient.send(new PutCommand({ TableName: VENDOR_PRODUCT_TABLE, Item: productItem }));
        res.status(201).json({ success: true, product: productItem });
    } catch (error) { res.status(500).json({ error: "Failed to upload product." }); }
});

app.get("/api/dealer/products/:dealerId", async (req, res) => {
    try {
        const { Items } = await docClient.send(new ScanCommand({
            TableName: VENDOR_PRODUCT_TABLE,
            FilterExpression: "dealerId = :dealerId",
            ExpressionAttributeValues: { ":dealerId": req.params.dealerId },
        }));
        res.json({ success: true, products: Items || [] });
    } catch (error) { res.status(500).json({ error: "Failed to fetch products." }); }
});

app.put("/api/dealer/products/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        const updatedProductData = { ...req.body, productId, price: Number(req.body.price) };
        if (isNaN(updatedProductData.price)) return res.status(400).json({ error: "Invalid price format." });
        await docClient.send(new PutCommand({ TableName: VENDOR_PRODUCT_TABLE, Item: updatedProductData }));
        res.json({ success: true, product: updatedProductData });
    } catch (error) { res.status(500).json({ error: "Failed to update product." }); }
});

app.delete("/api/dealer/products/:productId", async (req, res) => {
    try {
        await docClient.send(new DeleteCommand({ TableName: VENDOR_PRODUCT_TABLE, Key: { productId: req.params.productId } }));
        res.json({ success: true, message: "Product deleted successfully." });
    } catch (error) { res.status(500).json({ error: "Failed to delete product." }); }
});

// --- VENDOR ORDER MANAGEMENT ---
app.get("/api/vendor/orders/:dealerId", async (req, res) => {
    try {
        const { Items } = await docClient.send(new ScanCommand({ TableName: ORDERS_TABLE }));
        const vendorOrders = (Items || []).filter(order => order.items?.some(item => item.dealerId === req.params.dealerId));
        res.json({ success: true, orders: vendorOrders });
    } catch (error) { res.status(500).json({ error: "Failed to fetch vendor orders" }); }
});

// server.js - Update your vendor status route
app.put("/api/vendor/orders/:orderId/status", async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        
        // Use the ID sent from the frontend header if req.vendorId is missing
        const vendorId = req.vendorId || req.headers["x-dealer-id"]; 

        if (!vendorId) return res.status(401).json({ error: "Vendor ID missing" });

        const allowedStatuses = ["Processing", "Shipped", "Out for Delivery", "Delivered"];
        if (!allowedStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });

        const { Item: order } = await docClient.send(new GetCommand({ 
            TableName: ORDERS_TABLE, 
            Key: { orderId } 
        }));

        if (!order) return res.status(404).json({ error: "Order not found" });

        // Force string comparison to avoid type mismatches
        const isOwner = order.items.some(item => String(item.dealerId) === String(vendorId));

        if (!isOwner) {
            return res.status(403).json({ 
                success: false, 
                error: "Access Denied: You do not own any products in this order." 
            });
        }

        await docClient.send(new UpdateCommand({
            TableName: ORDERS_TABLE,
            Key: { orderId },
            UpdateExpression: "SET #s = :s",
            ExpressionAttributeNames: { "#s": "status" },
            ExpressionAttributeValues: { ":s": status }
        }));

        res.json({ success: true, message: "Status updated!" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update status" });
    }
});
// =============================================================================
//                               PUBLIC ROUTES
// =============================================================================

const formatProduct = (item) => ({
    id: item.productId, name: item.name, price: item.price,
    img: item.imageUrl, category: item.category, brand: item.brand, description: item.description
});

// --- server.js ---
app.get("/api/products", async (req, res) => {
    try {
        const adminScan = new ScanCommand({ TableName: PRODUCT_TABLE });
        const vendorScan = new ScanCommand({ TableName: VENDOR_PRODUCT_TABLE });

        const [adminRes, vendorRes] = await Promise.all([
            docClient.send(adminScan),
            docClient.send(vendorScan)
        ]);

        const formattedItems = [
            ...(adminRes.Items || []).map(item => ({
                id: item.productId,
                name: item.name,
                price: item.price,
                img: item.imageUrl,
                category: item.category,
                brand: item.brand,
                dealerId: null // Admin items have no dealerId
            })),
            ...(vendorRes.Items || []).map(item => ({
                id: item.productId,
                name: item.name,
                price: item.price,
                img: item.imageUrl,
                category: item.category,
                brand: item.brand,
                dealerId: item.dealerId // ✅ MUST INCLUDE THIS
            }))
        ];

        res.json({ success: true, items: formattedItems });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch products" });
    }
});

app.get("/api/products/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        let { Item } = await docClient.send(new GetCommand({ TableName: PRODUCT_TABLE, Key: { productId } }));
        if (!Item) {
            const vendorRes = await docClient.send(new GetCommand({ TableName: VENDOR_PRODUCT_TABLE, Key: { productId } }));
            Item = vendorRes.Item;
        }
        Item ? res.json({ success: true, product: formatProduct(Item) }) : res.status(404).json({ error: "Product not found" });
    } catch (error) { res.status(500).json({ error: "Failed to fetch product" }); }
});

app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: "Missing fields" });
    const item = { id: Date.now().toString(), name, email, message, createdAt: new Date().toISOString() };
    try {
        await docClient.send(new PutCommand({ TableName: CONTACT_TABLE, Item: item }));
        res.json({ success: true, data: item });
    } catch (error) { res.status(500).json({ error: "Failed to save message" }); }
});

app.post("/api/product-survey", async (req, res) => {
    const { productName, rating, feedback } = req.body;
    if (!productName || !rating) return res.status(400).json({ error: "Missing required fields" });
    const item = { id: Date.now().toString(), productName, rating, feedback: feedback || "", createdAt: new Date().toISOString() };
    try {
        await docClient.send(new PutCommand({ TableName: PRODUCT_SURVEY_TABLE, Item: item }));
        res.status(201).json({ success: true, message: "Survey saved" });
    } catch (error) { res.status(500).json({ error: "Failed to save survey" }); }
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

// =============================================================================
//                             ORDER & SEARCH LOGIC
// =============================================================================
app.post("/api/orders", async (req, res) => {
    try {
        const { userId, items, totalAmount, shipping, paymentId } = req.body;
        
        // 1. Validate incoming data
        if (!userId || !items || !items.length || !totalAmount || !paymentId) {
            return res.status(400).json({ error: "Missing required order fields." });
        }

        const orderId = Date.now().toString();
        const order = {
            orderId,
            userId,
            // Ensure every item carries its dealerId for vendor filtering
            items: items.map(item => ({
                productId: item.productId || item.id,
                dealerId: item.dealerId || null, 
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                imageUrl: item.imageUrl || item.img
            })),
            totalAmount,
            shipping,
            paymentId,
            status: "Processing", 
            createdAt: new Date().toISOString()
        };

        // 2. SAVE TO DYNAMODB
        await docClient.send(new PutCommand({ TableName: ORDERS_TABLE, Item: order }));

        // 3. 📩 AWS SES VENDOR NOTIFICATIONS
        const uniqueVendors = [...new Set(order.items.map(i => i.dealerId).filter(id => id))];

        for (const dealerId of uniqueVendors) {
            try {
                // Fetch vendor email from your DEALER_TABLE
                const { Item: vendor } = await docClient.send(new GetCommand({
                    TableName: DEALER_TABLE,
                    Key: { dealerId }
                }));

                if (vendor?.email) {
                    const vendorItems = order.items.filter(i => i.dealerId === dealerId);
                    const itemsHtml = vendorItems.map(i => `<li>${i.name} (x${i.quantity})</li>`).join('');

                    const params = {
                        Source: process.env.SYSTEM_EMAIL, // Must be verified in SES
                        Destination: { ToAddresses: [vendor.email] },
                        Message: {
                            Subject: { Data: `Action Required: New Order #${orderId}` },
                            Body: {
                                Html: { 
                                    Data: `<h3>New Order Received</h3><p>Fulfill these items: <ul>${itemsHtml}</ul></p>` 
                                }
                            }
                        }
                    };
                    await sesClient.send(new SendEmailCommand(params));
                }
            } catch (emailErr) {
                console.error(`Email failed for vendor ${dealerId}:`, emailErr);
            }
        }

        // 4. Trigger "Order Success" in the frontend
        res.status(201).json({ success: true, order });

    } catch (error) { 
        res.status(500).json({ error: "Order placement failed." }); 
    }
});

app.get("/api/orders", async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: "UserId required" });
        const { Items } = await docClient.send(new ScanCommand({
            TableName: ORDERS_TABLE,
            FilterExpression: "userId = :uid",
            ExpressionAttributeValues: { ":uid": userId }
        }));
        res.json(Items || []);
    } catch (error) { res.status(500).json({ error: "Failed to fetch orders" }); }
});

app.get("/api/search", async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length < 2) return res.json([]);
        const keyword = q.toLowerCase();

        const [adminRes, vendorRes] = await Promise.all([
            docClient.send(new ScanCommand({ TableName: PRODUCT_TABLE })),
            docClient.send(new ScanCommand({ TableName: VENDOR_PRODUCT_TABLE }))
        ]);

        const results = [...(adminRes.Items || []), ...(vendorRes.Items || [])]
            .filter(item => 
                item.name?.toLowerCase().includes(keyword) || 
                item.brand?.toLowerCase().includes(keyword) || 
                item.category?.toLowerCase().includes(keyword)
            )
            .slice(0, 8)
            .map(item => ({ id: item.productId, name: item.name, price: item.price, img: item.imageUrl }));

        res.json(results);
    } catch (error) { res.status(500).json([]); }
});

const { GoogleGenerativeAI } = require("@google/generative-ai");

// ✅ Initialize Gemini safely
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // This "prompt" tells the AI how to behave (Persona)
    const result = await model.generateContent(`
      You are the ShopEase Assistant. 
      Help the user with shopping questions. 
      Keep it short (max 2 sentences).
      User says: ${message}
    `);

    const response = await result.response;
    res.json({ reply: response.text() });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ reply: "I'm having a quick nap. Try again in a second!" });
  }
});
// ================= START SERVER =================
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));