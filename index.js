const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const OrderDetails = require("./modals/orderdetails");
const { ObjectId } = require('mongoose').Types;

app.use(express.json());
app.use(cors());

// Database Connection With MongoDB
mongoose.connect("mongodb+srv://Shoestore:Shoestore@cluster0.f5uoumb.mongodb.net/e-commerce");


//Image Storage Engine 
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
      console.log(file);
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({storage: storage})
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:4000/images/${req.file.filename}`
    })
})
app.use('/images', express.static('upload/images'));

// MiddleWare to fetch admin from database
const fetchadmin = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, "secret_ecom");
    req.admin = data.admin;
    next();
  } catch (error) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
};


// Schema for creating admin model
const Admins = mongoose.model("Admins", {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// MiddleWare to fetch user from database
const fetchuser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, "secret_ecom");
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
};

// Schema for creating user model
const Users = mongoose.model("Users", {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cartData: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});


// Schema for creating category
const Category = mongoose.model("Category", {
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  banner: {
    type: String,
    required: true,
  },
});   

// Schema for creating Product
const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subcategory: {
    type: String,
    required: true,
  },
  tags: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number
  },
  old_price: {
    type: Number
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
});

app.get("/", (req, res) => {
  res.send("Root");
});

//Create an endpoint at ip/login for login the admin and giving auth-token
app.post('/admin/login', async (req, res) => {
  console.log("Login");
    let success = false;
    let admin = await Admins.findOne({ email: req.body.email });
    if (admin) {
        const passCompare = req.body.password === admin.password;
        if (passCompare) {
            const data = {
                admin: {
                    id: admin.id
                }
            }
			success = true;
      console.log(admin.id);
			const token = jwt.sign(data, 'secret_ecom');
			res.json({ success, token });
        }
        else {
            return res.status(400).json({success: success, errors: "please try with correct email/password"})
        }
    }
    else {
        return res.status(400).json({success: success, errors: "please try with correct email/password"})
    }
})

//Create an endpoint at ip/auth for registering the admin in data base & sending token
app.post('/admin/signup', async (req, res) => {
  console.log("Sign Up");
        let success = false;
        let check = await Admins.findOne({ email: req.body.email });
        if (check) {
            return res.status(400).json({ success: success, errors: "existing user found with this email" });
        }
       
        const admin = new Admins({
            name: req.body.username,
            email: req.body.email,
            password: req.body.password,
            
        });
        await admin.save();
        const data = {
            admin: {
                id: admin.id
            }
        }
        
        const token = jwt.sign(data, 'secret_ecom');
        success = true; 
        res.json({ success, token })
    })



//Create an endpoint at ip/login for login the user and giving auth-token
app.post('/login', async (req, res) => {
  console.log("Login");
    let success = false;
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            }
			success = true;
      console.log(user.id);
			const token = jwt.sign(data, 'secret_ecom');
			res.json({ success, token });
        }
        else {
            return res.status(400).json({success: success, errors: "please try with correct email/password"})
        }
    }
    else {
        return res.status(400).json({success: success, errors: "please try with correct email/password"})
    }
})

//Create an endpoint at ip/auth for registering the user in data base & sending token
app.post('/signup', async (req, res) => {
  console.log("Sign Up");
        let success = false;
        let check = await Users.findOne({ email: req.body.email });
        if (check) {
            return res.status(400).json({ success: success, errors: "existing user found with this email" });
        }
        let cart = {};
          for (let i = 0; i < 300; i++) {
          cart[i] = 0;
        }
        const user = new Users({
            name: req.body.username,
            email: req.body.email,
            password: req.body.password,
            cartData: cart,
        });
        await user.save();
        const data = {
            user: {
                id: user.id
            }
        }
        
        const token = jwt.sign(data, 'secret_ecom');
        success = true; 
        res.json({ success, token })
    })

app.get("/allproducts", async (req, res) => {
	let products = await Product.find({});
  console.log("All Products");
    res.send(products);
});

app.get("/newcollections", async (req, res) => {
	let products = await Product.find({});
  let arr = products.slice(1).slice(-8);
  console.log("New Collections");
  res.send(arr);
});

app.get("/popularinwomen", async (req, res) => {
	let products = await Product.find({});
  let arr = products.splice(0,  4);
  console.log("Popular In Women");
  res.send(arr);
});




//Create an endpoint for saving the product in cart
app.post('/addtocart', fetchuser, async (req, res) => {
	console.log("Add Cart");
    let userData = await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({_id:req.user.id}, {cartData:userData.cartData});
    res.send("Added")
  })

  //Create an endpoint for saving the product in cart
app.post('/removefromcart', fetchuser, async (req, res) => {
	console.log("Remove Cart");
    let userData = await Users.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId]!=0)
    {
      userData.cartData[req.body.itemId] -= 1;
    }
    await Users.findOneAndUpdate({_id:req.user.id}, {cartData:userData.cartData});
    res.send("Removed");
  })

  //Create an endpoint for saving the product in cart
app.post('/1getcart', fetchuser, async (req, res) => {
  console.log("Get Cart");
  let userData = await Users.findOne({_id:req.user.id});
  res.json(userData.cartData);
  console.log(userData.cartData);
  })

  app.post('/getcart', fetchuser, async (req, res) => {
    console.log("Get Cart");
    let userData = await Users.findOne({_id:req.user.id});
  
    // Filter out values not equal to 0
    let filteredCartData = {};
    for (let key in userData.cartData) {
      if (userData.cartData[key] !== 0) {
        filteredCartData[key] = userData.cartData[key];
      }
    }
    // Product.find
    res.json(filteredCartData);
    console.log(filteredCartData);
  });
  


app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id;
  if (products.length>0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id+1;
  }
  else
  { id = 1; }
  const product = new Product({
    id: id,
    name: req.body.name,
    description: req.body.description,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
    subcategory: req.body.subcategory,
    tags: req.body.tags,
  });
  console.log(product);
  await product.save();
  console.log("Saved");
  res.json({success:true,name:req.body.name})
});


app.post("/editproduct/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    // const productId = req.params.id;
    const productId = new ObjectId(req.params.id);
    const updatedProduct = {
      name: req.body.name,
      description: req.body.description,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
      subcategory: req.body.subcategory,
      tags: req.body.tags,
    };

    const product = await Product.findByIdAndUpdate(productId, updatedProduct, { new: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    console.log("Product updated:", product);
    res.json({ success: true, product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// add order details
app.post("/addorderdetails", fetchuser, async (req, res) => {
  console.log(req.user.id);

  try {
    // const user = await Users.findOne({ _id: req.user.id });

    const orderDetails = new OrderDetails({
      userId: req.user.id,
      fullName: req.body.fullName,
      phoneNumber: req.body.phoneNumber,
      streetAddress: req.body.streetAddress,
      selectedState: req.body.selectedState,
      selectedDistrict: req.body.selectedDistrict
    });

    console.log(orderDetails);
    await orderDetails.save();
    console.log("Saved");

    res.json({ success: true, name: req.body.name });
  } catch (error) {
    console.error("Error adding order details:", error);
    res.status(500).json({ success: false, error: "Error adding order details" });
  }
});

app.get("/getorderdetails", async (req, res) => {
  try {
      const orderDetails = await OrderDetails.find().populate('userId');
      res.json(orderDetails);
  } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).json({ success: false, error: "Error fetching order details" });
  }
});

app.post("/removeproduct", async (req, res) => {
  const product = await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({success:true,name:req.body.name})
});

// add category
app.post("/addcategory", async (req, res) => {
  // create id from name by removing white spaces and lowering case
  const id = req.body.name.replace(/\s+/g, "").toLowerCase();
  const category = new Category({
    id: id,
    name: req.body.name,
    banner: req.body.banner,
  });
  console.log(category);
  await category.save();
  console.log("Saved");
  res.json({ success: true, name: req.body.name });
});

// Remove category
app.post("/removecategory", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.body.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    }
    console.log("Removed category:", category.name);
    res.json({ success: true, name: category.name });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, error: "Failed to remove category" });
  }
});

// Edit category
app.post("/editcategory", async (req, res) => {
  try {
    const { id, newName } = req.body;
    const category = await Category.findByIdAndUpdate(
      id,
      { name: newName },
      { new: true }
    );
    if (!category) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    }
    console.log("Updated category:", category.name);
    res.json({ success: true, name: category.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to edit category" });
  }
});

// fetch category by id
app.get("/category/:id", async (req, res) => {
    console.log(req.params.id);
    try {
        const category = await Category.find({ id: req.params.id });
        console.log(category);
        res.json(category);  
    }
    catch (error) {
        console.error(error);
    }
})

app.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

app.listen(port, (error) => {
  if (!error) console.log("Server Running on port " + port);
  else console.log("Error : ", error);
});
