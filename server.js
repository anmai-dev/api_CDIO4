const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const authRoute = require('./src/routes/Auth');
const userRoute = require('./src/routes/User');
// const postRoute = require("./src/routes/Post");
// const matchRoute = require("./src/routes/Match");
const videoRoute = require("./src/routes/Video");
// const linkRoute = require("./src/routes/Link");
const portfinder = require('portfinder');

dotenv.config();

// Kết nối MongoDB
mongoose.connect(process.env.URL_MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => console.log("DB connection successful"))
    .catch((err) => console.log(err));

// Cấu hình CORS
app.use(cors({
    origin: '*', // Cho phép tất cả các origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
    credentials: true,
    exposedHeaders: ['Access-Control-Allow-Origin']
}));


app.use((req, res, next) => {

    if (req.originalUrl === '/api/post/create') {
        console.log('Bỏ qua express-fileupload cho route post/create vì sử dụng multer');
        return next();
    }

    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp/',
        createParentPath: true,
        limits: { fileSize: 100 * 1024 * 1024 },
        abortOnLimit: true,
        debug: true,
    })(req, res, next);
});

// Xử lý dữ liệu JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Tạo thư mục uploads nếu chưa tồn tại
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Đã tạo thư mục uploads');
}

const videoDir = path.join(uploadDir, 'videos');
const thumbDir = path.join(uploadDir, 'thumbnails');

if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
    console.log('Đã tạo thư mục uploads/videos');
}

if (!fs.existsSync(thumbDir)) {
    fs.mkdirSync(thumbDir, { recursive: true });
    console.log('Đã tạo thư mục uploads/thumbnails');
}

try {
    fs.accessSync(uploadDir, fs.constants.R_OK);
    console.log('✅ Thư mục uploads có quyền đọc');

    fs.accessSync(uploadDir, fs.constants.W_OK);
    console.log('✅ Thư mục uploads có quyền ghi');

    const files = fs.readdirSync(uploadDir);
    console.log('📁 Các file trong thư mục uploads:', files);

    // Liệt kê các file trong thư mục thumbnails
    if (fs.existsSync(thumbDir)) {
        const thumbFiles = fs.readdirSync(thumbDir);
        console.log('📁 Các file trong thư mục thumbnails:', thumbFiles);
    }
} catch (err) {
    console.error('❌ Lỗi kiểm tra quyền truy cập:', err);
}

// Phục vụ các file tĩnh
console.log('Cấu hình đường dẫn tĩnh: ' + path.join(__dirname, 'uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Định tuyến (routes)
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
// app.use('/api/post', postRoute);
// app.use('/api/match', matchRoute);
app.use('/api/video', videoRoute);
// app.use('/api/links', linkRoute);

// Log tất cả các request để gỡ lỗi
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Route test cho uploads
app.get('/test-uploads', (req, res) => {
    try {
        const files = fs.readdirSync(uploadDir);
        const thumbFiles = fs.existsSync(thumbDir) ? fs.readdirSync(thumbDir) : [];

        res.json({
            message: 'Danh sách file trong thư mục uploads',
            uploads: files,
            thumbnails: thumbFiles
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Xử lý tắt server đúng cách
process.on('SIGINT', () => {
    console.log('Đang tắt server...');
    server.close(() => {
        console.log('Server đã tắt.');
        process.exit(0);
    });
});

// Chạy server trên port 8000
const PORT = 8000;
const server = app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});
