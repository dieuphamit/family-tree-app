# 🌳 Family Tree Application

Ứng dụng quản lý sơ đồ cây gia phả với giao diện hiện đại, hỗ trợ thêm/sửa/xóa thành viên, quản lý mối quan hệ, và hiển thị tree view trực quan.

## ✨ Tính năng

- 🌳 **Hiển thị cây gia phả** - Tree view trực quan với ReactFlow
- ➕ **Quản lý thành viên** - Thêm, sửa, xóa thông tin thành viên
- 📸 **Upload hình ảnh** - Hỗ trợ ảnh đại diện cho từng thành viên
- 🖱️ **Drag & Drop** - Di chuyển nodes trên canvas
- 🔗 **Quản lý mối quan hệ** - Cha mẹ, vợ chồng, con cái, ông bà
- 📱 **Responsive** - Hoạt động tốt trên desktop và mobile
- 🎨 **UI hiện đại** - Glassmorphism design với animations mượt mà

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Multer (file upload)
- CORS

### Frontend
- React + Vite
- ReactFlow (tree visualization)
- Axios (API client)
- Modern CSS (Glassmorphism)

## 📦 Cài đặt

### Yêu cầu
- Node.js >= 16
- MongoDB (local hoặc cloud)

### Backend Setup

\`\`\`bash
cd backend
npm install
cp .env.example .env
# Chỉnh sửa .env nếu cần (mặc định MongoDB local)
npm run dev
\`\`\`

Backend sẽ chạy tại: `http://localhost:5000`

### Frontend Setup

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Frontend sẽ chạy tại: `http://localhost:5173`

## 🚀 Sử dụng

1. **Khởi động MongoDB** (nếu dùng local):
   \`\`\`bash
   mongod
   \`\`\`

2. **Khởi động Backend**:
   \`\`\`bash
   cd backend
   npm run dev
   \`\`\`

3. **Khởi động Frontend** (terminal mới):
   \`\`\`bash
   cd frontend
   npm run dev
   \`\`\`

4. Mở trình duyệt tại `http://localhost:5173`

## 📝 API Endpoints

### Members
- `GET /api/members` - Lấy tất cả thành viên
- `GET /api/members/:id` - Lấy thông tin một thành viên
- `POST /api/members` - Tạo thành viên mới
- `PUT /api/members/:id` - Cập nhật thông tin
- `DELETE /api/members/:id` - Xóa thành viên

### Relationships
- `GET /api/relationships` - Lấy tất cả mối quan hệ
- `POST /api/relationships` - Tạo mối quan hệ mới
- `DELETE /api/relationships/:id` - Xóa mối quan hệ

### Upload
- `POST /api/upload/photo` - Upload ảnh thành viên

## 📁 Cấu trúc thư mục

\`\`\`
family-tree-app/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── Member.js
│   │   └── Relationship.js
│   ├── routes/
│   │   ├── members.js
│   │   ├── relationships.js
│   │   └── upload.js
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── FamilyTree.jsx
    │   │   ├── MemberNode.jsx
    │   │   └── MemberForm.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json
\`\`\`

## 🎨 Design System

- **Glassmorphism** - Frosted glass effects
- **Color Palette**:
  - Primary: #2563EB (Blue)
  - Female: #EC4899 (Pink)
  - Male: #2563EB (Blue)
  - Other: #8B5CF6 (Purple)
- **Typography**: Inter font family
- **Animations**: Smooth transitions (300ms)

## 🔧 Môi trường phát triển

Environment variables (`.env`):

\`\`\`env
MONGODB_URI=mongodb://localhost:27017/family-tree
PORT=5000
\`\`\`

## 📄 License

MIT

## 👨‍💻 Author

Created with ❤️ by VibeGravityKit Team
