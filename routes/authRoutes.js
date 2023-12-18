import express from "express";
import { registerController, loginController, testController, forgotPasswordController, updateProfileController, getOrdersController, getAllOrdersController, orderStatusController, photoController } from "../controllers/authController.js";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";
import formidable from "express-formidable";


//router object
const router = express.Router()

//routing
//register (Method Post)
router.post('/register',formidable(), registerController);

//get user photo
router.get('/get-photo/:id',photoController);

//login (Method Post)
router.post('/login', loginController);

//test routes
router.get('/test', requireSignIn, isAdmin, testController);

//forgot passwors(Method Post)
router.post("/forgot-password", forgotPasswordController);

//protected user routes auth
router.get("/user-auth", requireSignIn, (req, res) => {
    res.status(200).send({ ok: true });
});

//protected admin routes auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
    res.status(200).send({ ok: true });
});

//update profile
router.put("/profile", requireSignIn,formidable(), updateProfileController);

//orders
router.get("/orders", requireSignIn, getOrdersController)

//all orders
router.get("/all-orders", requireSignIn, getAllOrdersController)

//all order status update
//
router.put("/order-status/:orderId",requireSignIn,isAdmin,orderStatusController)

export default router;