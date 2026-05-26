import bcrypt from "bcryptjs";


export const hashPassword = async(password) => {
    return await bcrypt.hash(password, 12);
}

//bool
export const verifyPassword = async (password, hashPassword) => {
  return await bcrypt.compare(password, hashPassword);
};