import jwt from "jsonwebtoken"

import { generateAccessToken } from "./accessToken.config.js"

export const refreshAccessToken=(req,res)=>{

    const {refreshToken}=req.body();

    if(!refreshToken){
        return res.status(401)
            .json({
                message:"refresh token missing"
            })
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const accessToken = generateAccessToken({id:decoded.id,})

        res.cookie(
            "accessToken",
            accessToken,
            {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 15 * 60 * 1000
            }
        )
    } catch (error) {
        return res
            .status(403)
            .json({
                message:"invalid refresh token"
            })
    }

}