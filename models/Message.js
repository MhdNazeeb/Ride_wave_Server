const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
 chatId:{
    type:String
 },
 senderId:{
    type:String
 },
 text:{
    type:String
 }

})
const chatModel = mongoose.model('Message',messageSchema)
export default chatModel