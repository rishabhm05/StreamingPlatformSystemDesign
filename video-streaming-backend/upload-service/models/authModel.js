
import pool from "../utils/dbConfig.js"
export const createUser =async(email,name,picture)=>{
 const query = `Insert into gold."Users" (email,name,picture) values($1,$2,$3) Returning *`;
 const params =[email,name,picture];
 const result = await pool.query(query,params);
 return result.rows;

}

export const checkUser = async(email)=>{
const query =`Select * from gold."Users" where email=$1`;
const params =[email];
const result =await pool.query(query,params);
return result&&result.length>0?true:false;
}
export const getUserdetails = async (email)=>{
const query = `Select * from gold."Users" where email=$1 `;
const params =[email];
const result =await pool.query(query,params);
return result.rows[0];
}

export const saveVideoDetails =async(author,title,s3_file_path,description) =>{
    const query = `Insert into gold."videos_data" (author,title,s3_file_path,description) values($1,$2,$3,$4) Returning *`;
    const params =[author,title,s3_file_path,description];
    const result = await pool.query(query,params)
    return result.rows;
}

export const getVideosPaths = async()=>{
    const query =`Select s3_path from gold."Stream"`;
    const result = await pool.query(query);
    return result.rows;
}