
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


const getCategoryById=async(req,res)=>{
    const {id}=req.params;
    try {
        const category=await prisma.category.findUnique({where:{id}});
        if(!category){
            return res.status(404).json({error:"Category not found"});
        }
        res.status(200).json(category);
    } catch (error) {
        console.error(error);
        res.status(500).json({error:"Error fetching category"});
    }
}
const getAllCategories=async(req,res)=>{
    try {
        const categories=await prisma.category.findMany();
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({error:"Error fetching categories"});
    }
}
const updateCategory=async(req,res)=>{
    const {id}=req.params;

    const {name,description,ar_name, ar_description}=req.body;
    if(!name || !description || !ar_name || !ar_description){
        return res.status(400).json({error:"Name and description are required"});
    }
    try {
        const updatedCategory=await prisma.category.update({
            where:{id},
            data:{name,description,
                ar_description,ar_name
            }
        });
        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({error:"Error updating category"});
    }
}

const createCategory=async(req,res)=>{
    const {name,description,ar_name, ar_description}=req.body;
    if(!name ){
        return res.status(400).json({error:"Name and description are required"});
    }
    try {
        const newCategory=await prisma.category.create({
            data:{name, description: description || "",
                ar_name, ar_description
            }
        });
        res.status(201).json(newCategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({error:"Error creating category"});
    }
}

const deleteCategory=async(req,res)=>{
    const {id}=req.params;
    try {
        await prisma.category.delete({where:{id}});
        res.status(200).json({message:"Category deleted successfully"});
    } catch (error) {
        console.error(error);
        res.status(500).json({error:"Error deleting category"});
    }
}

export {
  getCategoryById,
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
};