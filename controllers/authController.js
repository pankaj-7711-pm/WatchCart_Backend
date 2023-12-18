import { json } from "express";
import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";
import orderModel from "../models/orderModel.js";
import fs from "fs";
import { timeStamp } from "console";


//for register
export const registerController = async (req, res) => {
    try {
        const { name, email, password, phone, address, answer } = req.fields;
        const { photo } = req.files;
        //validations
        if (!name) {
            return res.send({ message: 'Name is required' })
        }
        if (!email) {
            return res.send({ message: 'Email is required' })
        }
        if (!password) {
            return res.send({ message: 'Password is required' })
        }
        if (!phone) {
            return res.send({ message: 'Phone number is required' })
        }
        if (!address) {
            return res.send({ message: 'Address is required' })
        }
        if (!answer) {
            return res.send({ message: 'Answer to the question is required' })
        }
        // if(photo && photo.size()>1000000){
        //     res.send({message:"Photo size should be less than 1mb"})
        // }
        //check user
        const existingUser = await userModel.findOne({ email });

        // existing user
        if (existingUser) {
            return res.send({
                success: false,
                message: "Already Registered Please Login"
            })
        }

        //register user
        const hashedPassword = await hashPassword(password);

        //save
        const user = new userModel({ name, email, phone, address, password: hashedPassword, answer });
        if (photo) {
            user.photo.data = fs.readFileSync(photo.path);
            user.photo.contentType = photo.type;
        }
        await user.save();
        res.status(201).send({
            success: true,
            message: "User Registered Successfully",
            user
        })
    }
    catch (error) {
        // console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in Registration",
            error
        })
    }
}

//get photo
export const photoController = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id).select("photo");
        if (user.photo.data) {
            res.set('Content-type', user.photo.contentType);
            return res.status(200).send(user.photo.data);
        }
    } catch (error) {
        // console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in getting photo",
            error
        })
    }
}

//for login
export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        //validation
        if (!email || !password) {
            return res.status(404).send({
                success: false,
                message: "Invalid email or password"
            })
        }
        //check user
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.send({
                success: false,
                message: "User not registered",

            })
        }
        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.status(200).send({
                success: false,
                message: "Invalid Login"
            })
        }
        //token
        const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(200).send({
            success: true,
            message: "Login Successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
            },
            token,
        });
    }
    catch (error) {
        // console.log(error);
        res.status(500).send({
            success: false,
            message: "error in login",
            error
        })
    }
}

//forgot password controller
export const forgotPasswordController = async (req, res) => {
    try {
        const { email, newPassword, answer } = req.body;
        if (!email) {
            res.status(400).send({ message: "Email is required" });
        }
        if (!answer) {
            res.status(400).send({ message: "Answer is required" });
        }
        if (!newPassword) {
            res.status(400).send({ message: "Enter new Password" });
        }
        //check
        const user = await userModel.findOne({ email, answer });
        //validation
        if (!user) {
            res.send({
                success: false,
                message: "Wrong Email or Answer"
            })
        }
        const hashed = await hashPassword(newPassword);
        await userModel.findByIdAndUpdate(user._id, { password: hashed });
        res.status(200).send({
            success: true,
            message: "Password changed successfully"
        })
    } catch (error) {
        // console.log(error);
        res.send({
            success: false,
            message: "Something went wrong from server",
            error
        })
    }
}
//test controller
export const testController = (req, res) => {
    res.send("protected routes");
}

//update controller
export const updateProfileController = async (req, res) => {
    try {
        const { name, password, phone, address } = req.fields;
        const { photo } = req.files;
        if (!name) {
            return res.send({ message: 'Name is required' })
        }
        if (!password) {
            return res.send({ message: 'Password is required' })
        }
        if (!phone) {
            return res.send({ message: 'Phone number is required' })
        }
        if (!address) {
            return res.send({ message: 'Address is required' })
        }
        // if(photo && photo.size()>1000000){
        //     res.send({message:"Photo size should be less than 1mb"})
        // }

        const hashed = await hashPassword(password);

        const updatedUser = await userModel.findByIdAndUpdate(req.user._id, {
            ...req.fields, password:hashed
        }, { new: true });

        if (photo) {
            updatedUser.photo.data = fs.readFileSync(photo.path);
            updatedUser.photo.contentType = photo.type;
        }
        await updatedUser.save();
        res.status(200).send({
            success: true,
            message: "Profile Updated Successfully",
            updatedUser:{
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                address: updatedUser.address,
                role: updatedUser.role,
            }
        })
    } catch (error) {
        // console.log(error);
        res.status(400).send({
            success: false,
            message: "Error while updating profile",
            error
        })
    }
}

//orders
export const getOrdersController = async (req, res) => {
    try {
        const orders = await orderModel.find({ buyer: req.user._id }).populate("products", "-photo").populate("buyer", "name").sort({createdAt:"-1"});
        res.json(orders);
    } catch (error) {
        // console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while Geting Orders",
            error
        })
    }
}

//all orders
export const getAllOrdersController = async (req, res) => {
    try {
        const orders = await orderModel.find({}).populate("products", "-photo").populate("buyer", "name").sort({ createdAt: "-1" });
        res.json(orders);
    } catch (error) {
        // console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while Geting All Orders",
            error
        })
    }
}

//update status of the order
export const orderStatusController = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const orders = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true })
        res.json(orders);
    } catch (error) {
        // console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while Updating Order Status",
            error
        })
    }
}