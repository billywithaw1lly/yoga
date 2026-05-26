import { success } from "zod";
import { prisma } from "../../db/prisma.db";

export const getUser = (req, res) => {

    try {
        const user = req.user;
    
        const foundUser = await prisma.user.findFirst({
            where: {
                id: user.id,
            },
        });
    
        if(!foundUser){
            return res
                    .status(404)
                    .json({
                        success:false,
                        message:"user not found",
                    })
        }
    
        return res.status(200).json({
            success: true,
            message: "User found.",
            data: {
                id:        foundUser.id,
                name:      foundUser.name,
                email:     foundUser.email,
                role:      foundUser.role,
                level:     foundUser.level,
                avatarUrl: foundUser.avatarUrl,
                createdAt: foundUser.createdAt,
            },
        });
    } catch (error) {
            console.error("Get user error:", error);
            return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
}