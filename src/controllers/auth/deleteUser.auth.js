import { prisma } from "../../db/prisma.db.js"

export const deleteUser = async (req, res) => {
    try {
        const {id} = req.user

        const user = await prisma.user.findUnique({ where : {id} })

        if(!user){
            return res
                    .status(404)
                    .json({
                        success:false,
                        message:"user not found"
                    })
        }
        await prisma.user.delete({ where : {id} })

        res.clearCookie("accessToken" , {httpOnly : true, sameSite : "strict"})
        res.clearCookie("refreshToken" , {httpOnly : true, sameSite : "strict"})

        return res
                .status(200)
                .json({
                    success:true,
                    message:"user deleted successfully"
                })
    } catch (error) {
        return res
                .status(500)
                .json({
                    success:false,
                    message:"internal server error"
                })
    }
}