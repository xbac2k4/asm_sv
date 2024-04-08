const express = require('express');
const router = express.Router();
const database = require('../config/connect');
const DistributorModel = require('../model/Distributor');
const FruitModel = require('../model/fruits');
const Upload = require('../config/common/upload');
const Users = require('../model/users');

// const unidecode = require('unidecode');

// distributor
router.get('/get-distributor', async (req, res) => {
    try {
        let distributor = await DistributorModel.find().populate();
        console.log(distributor);
        res.json({
            "status": 200,
            "messenger": "Danh sách distributor",
            "data": distributor
        })
    } catch (error) {
        console.log(error);
    }

    // res.send(distributor)
})

// Thêm sản phẩm
router.post("/add-distributor", async (req, res) => {
    try {
        const { name } = req.body;

        // Tạo một instance mới của model sản phẩm
        const newDistributor = new DistributorModel({
            //    title
            name: name
        });

        // Lưu sản phẩm mới vào cơ sở dữ liệu
        const savedDistributor = await newDistributor.save();
        if (savedDistributor) {
            res.json({
                "status": 200,
                "messenger": "Thâm thành công",
                "data": savedDistributor
            })
        }
        
        // res.status(201).json(savedDistributor); // Trả về sản phẩm vừa được tạo thành công
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Sửa sản phẩm
router.put("/update-distributor-by-id/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const updatedDistributor = await DistributorModel.findByIdAndUpdate(
            id,
            { name },
            { new: true }
        );

        if (!updatedDistributor) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        const result = await updatedDistributor.save();
        if (result) {
            res.json({
                'status': 200,
                'messenger': 'Cập nhật thành công',
                'data': result
            })
        }
        // res.json(updatedDistributor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/search-distributor-by-name', async (req, res) => {
    const {name} = req.query;
    try {
        const data = await DistributorModel.find({
            name: { $regex: new RegExp(name, "i") },
        }).sort({ createdAt: -1 });
        
        if (data) {
            res.json({
                "status": 200,
                "messenger": "Thành công",
                "data": data
            })
        } else {
            res.json({
                "status": 400,
                "messenger": "Lỗi, không thành công",
                "data": []
            })
        }
        // res.send(results);
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).json({ error: "Đã xảy ra lỗi khi tìm kiếm" });
    }
});

// Xóa sản phẩm
router.delete("/delete-distributor-by-id/:id", async (req, res) => {
    try {
        const { id } = req.params
        const result = await DistributorModel.findByIdAndDelete(id);
        if (result) {
            res.json({
                "status": 200,
                "messenger": "Xóa thành công",
                "data": result
            })
        } else {
            res.json({
                "status": 400,
                "messenger": "Lỗi! xóa không thành công",
                "data": []
            })
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// fruits
router.get('/get-fruit', async (req, res) => {
    try {
        let data = await FruitModel.find().populate('id_distributor');
        console.log(data);
        res.json({
            "status": 200,
            "messenger": "Danh sách Fruit",
            "data": data
        })
    } catch (error) {
        console.log(error);
    }
    // res.send(distributor)
})

//upload image
router.post('/add-fruit-with-file-image', Upload.array('image', 5), async (req, res) => {
    //Upload.array('image',5) => up nhiều file tối đa là 5
    //upload.single('image') => up load 1 file
    try {
        const data = req.body; // Lấy dữ liệu từ body
        const { files } = req //files nếu upload nhiều, file nếu upload 1 file
        const urlsImage =
            files.map((file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`)
        //url hình ảnh sẽ được lưu dưới dạng: http://localhost:3000/upload/filename
        const newfruit = new FruitModel({
            name: data.name,
            quantity: data.quantity,
            price: data.price,
            status: data.status,
            image: urlsImage, /* Thêm url hình */
            description: data.description,
            id_distributor: data.id_distributor
        }); //Tạo một đối tượng mới
        const result = (await newfruit.save()).populate("id_distributor"); //Thêm vào database
        if (result) {// Nếu thêm thành công result !null trả về dữ liệu
            res.json({
                "status": 200,
                "messenger": "Thêm thành công",
                "data": result
            })
        } else {// Nếu thêm không thành công result null, thông báo không thành công
            res.json({
                "status": 400,
                "messenger": "Lỗi, thêm không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
});
router.put('/update-fruit-by-id/:id', Upload.array('image', 5), async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const { files } = req;
        const urlsImage =
            files.map((file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`);
        const updatefruit = await FruitModel.findByIdAndUpdate(id)
        files.map((file) => console.log(123, file.filename));
        console.log(345, updatefruit.image);

        let result = null;
        if (updatefruit) {
            updatefruit.name = data.name ?? updatefruit.name,
                updatefruit.quantity = data.quantity ?? updatefruit.quantity,
                updatefruit.price = data.price ?? updatefruit.price,
                updatefruit.status = data.status ?? updatefruit.status,
                updatefruit.image = urlsImage ?? updatefruit.image,
                updatefruit.description = data.description ?? updatefruit.description,
                updatefruit.id_distributor = data.id_distributor ?? updatefruit.id_distributor,
                result = await updatefruit.save();
        }
        if (result) {
            res.json({
                'status': 200,
                'messenger': 'Cập nhật thành công',
                'data': result
            })
        } else {
            res.json({
                'status': 400,
                'messenger': 'Cập nhật không thành công',
                'data': []
            })
        }
    } catch (error) {
        console.log(error);
    }
})

//delete fruit
router.delete('/delete-fruit-by-id/:id', async (req, res) => {
    try {
        const { id } = req.params
        const result = await FruitModel.findByIdAndDelete(id);
        if (result) {
            res.json({
                "status": 200,
                "messenger": "Xóa thành công",
                "data": result
            })
        } else {
            res.json({
                "status": 400,
                "messenger": "Lỗi! xóa không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
})

// // check token
// const firebaseAdmin = require('firebase-admin');
// const serviceAccount = require('../config/common/qldt-5b445-firebase-adminsdk-lm70g-88f2d16ebc.json');

// firebaseAdmin.initializeApp({
//     credential: firebaseAdmin.credential.cert(serviceAccount),
// });

// // Middleware để xác thực token
// const authenticateToken = async (req, res, next) => {
//     const token = req.headers.authorization;

//     if (!token) {
//         return res.status(401).json({ error: 'Access denied. Token is required.' });
//     }

//     try {
//         const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
//         req.user = decodedToken;
//         next();
//     } catch (error) {
//         return res.status(401).json({ error: 'Invalid token.' });
//     }
// };
// router.get('/get-fruit-authenticate-token', authenticateToken, async (req, res) => {
//     try {
//         let data = await FruitModel.find().populate('id_distributor');
//         console.log(data);
//         res.json({
//             "status": 200,
//             "messenger": "Danh sách Fruit",
//             "data": data
//         })
//     } catch (error) {
//         console.log(error);
//     }
//     // res.send(distributor)
// })

// search fruits
router.get('/search-fruit-by-name', async (req, res) => {
    const {name} = req.query;
    try {
        const data = await FruitModel.find({
            name: { $regex: new RegExp(name, "i") },
        }).populate('id_distributor').sort({ createdAt: -1 });
        
        if (data) {
            res.json({
                "status": 200,
                "messenger": "Thành công",
                "data": data
            })
        } else {
            res.json({
                "status": 400,
                "messenger": "Lỗi, không thành công",
                "data": []
            })
        }
        // res.send(results);
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).json({ error: "Đã xảy ra lỗi khi tìm kiếm" });
    }
});

const Transporter = require('../config/common/mail')
router.post('/register-send-email', Upload.single('avartar'), async (req, res) => {
    try {
        const data = req.body;
        const { file } = req
        const newUser = Users({
            username: data.username,
            password: data.password,
            email: data.email,
            name: data.name,
            avartar: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
            //url avatar http://localhost:3000/uploads/filename
        })
        const result = await newUser.save()
        if (result) { //Gửi mail
            const mailOptions = {
                from: "ngoxuanbac2k4@gmail.com", //email gửi đi
                to: result.email, // email nhận
                subject: "Đăng ký thành công", //subject
                text: "Cảm ơn bạn đã đăng ký", // nội dung mail
            };
            // Nếu thêm thành công result !null trả về dữ liệu
            await Transporter.sendMail(mailOptions); // gửi mail
            res.json({
                "status": 200,
                "messenger": "Thêm thành công",
                "data": result
            })
        } else {// Nếu thêm không thành công result null, thông báo không thành công
            res.json({
                "status": 400,
                "messenger": "Lỗi, thêm không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
})

const JWT = require('jsonwebtoken');
const SECRETKEY = "FPTPOLYTECHNIC"
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await Users.findOne({ username, password })
        if (user) {
            //Token người dùng sẽ sử dụng gửi lên trên header mỗi lần muốn gọi api
            const token = JWT.sign({ id: user._id }, SECRETKEY, { expiresIn: '1h' });
            //Khi token hết hạn, người dùng sẽ call 1 api khác để lấy token mới
            //Lúc này người dùng sẽ truyền refreshToken lên để nhận về 1 cặp token,refreshToken mới
            //Nếu cả 2 token đều hết hạn người dùng sẽ phải thoát app và đăng nhập lại
            const refreshToken = JWT.sign({ id: user._id }, SECRETKEY, { expiresIn: '1d' })
            //expiresIn thời gian token
            res.json({
                "status": 200,
                "messenger": "Đăng nhâp thành công",
                "data": user,
                "token": token,
                "refreshToken": refreshToken
            })
        } else {
            // Nếu thêm không thành công result null, thông báo không thành công
            res.json({
                "status": 400,
                "messenger": "Lỗi, đăng nhập không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.get('/get-list-fruit', async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log(authHeader);
    if (!authHeader) {
        return res.sendStatus(401); // Kiểm tra xem header Authorization có tồn tại không
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401); // Kiểm tra xem token có tồn tại không
    }

    try {
        const payload = JWT.verify(token, SECRETKEY); // Xác thực token
        console.log(payload);

        const data = await FruitModel.find().populate('id_distributor');
        res.json({
            "status": 200,
            "message": 'Danh sách fruit',
            "data": data
        });
    } catch (error) {
        if (error instanceof JWT.TokenExpiredError) {
            return res.sendStatus(401); // Token hết hạn
        } else {
            console.error(error);
            return res.sendStatus(403); // Lỗi xác thực
        }
    }
});


module.exports = router;