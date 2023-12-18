import slugify from "slugify";
import CategoryModel from "../models/CategoryModels.js"

export const createCategoryController=async(req,res)=>{
    try {
        const {name}=req.body;
        if(!name){
            return res.status(400).send({messgage:"Name is required"});
        }
        const existingCategory=await CategoryModel.findOne({name});
        if(existingCategory){
           return res.status(200).send({
                success:false,
                message:"Category Already Exists"
            })
        }
        const category=await new CategoryModel({name,slug:slugify(name)}).save();
        return res.status(201).send({
            success:true,
            message:"Category Created Successfully",
            category
        })


    } catch (error) {
        // console.log(error);
        res.status(500).send({
            success:false,
            messgage:"Error in category",
            error
        })
    }
}

//update category controller

export const updateCategoryController=async(req,res)=>{
    try {
        const {name}=req.body;
        const {id}=req.params;
        const category=await CategoryModel.findByIdAndUpdate(id,{name,slug:slugify(name)},{new:true});
        res.status(200).send({
            success:true,
            message:"Category Updated Successfully",
            category
        })
    } catch (error) {
        // console.log(error);
        res.status(500).send({
            success:false,
            message:"Error while updating",
            error
        })
    }
}

//get all category

export const categoryController=async(req,res)=>{
    try {
        const category=await CategoryModel.find({});
        res.status(200).send({
            success:true,
            message:"All Categories List",
            category
        })
    } catch (error) {
        // console.log(error);
        res.status(500).send({
            success:true,
            message:"Error while getting all categories",
            error
        })
    }
}

//get single category

export const singleCategoryController=async(req,res)=>{
    try {
        const {slug}=req.params;
        const category=await CategoryModel.findOne({slug});
        res.status(200).send({
            success:true,
            message:"Get Single Category Sucessfull",
            category
        })

    } catch (error) {
        // console.log(error);
        res.status(500).send({
            success:false,
            message:"Error in Category",
            error
        })
    }
}

//delete category

export const deleteCategoryController=async(req,res)=>{
    try {
        const {id}=req.params;
        await CategoryModel.findByIdAndDelete(id);
        res.status(200).send({
            success:true,
            message:"Category Deleted Successfully"
        })
    } catch (error) {
        // console.log(error);
        res.status(500).send({
            success:false,
            message:"Error in category deletion",
            error
        })
    }
}