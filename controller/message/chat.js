const chatModel = require("../../models/Chat");
const userModel = require("../../models/user");

const CreateChat = async (req, res) => {
  const { senderId, receiverId } = req.body;
  try {
    const existingConversation = await chatModel.findOne({
      $or: [
        { members: [senderId, receiverId] },
        { members: [receiverId, senderId] },
      ],
    });
    if(!existingConversation){
      const newChat = await chatModel.create({
        members: [senderId, receiverId],
      });
      res.status(200).json(newChat);
    }else{
      res.status(200).json({message:'already'})
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json();
  }
};
const userChats = async (req, res) => {
  const { userId } = req.params;
  try {
    const chat = await chatModel.find({ members: { $in: [userId] } });
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json(error);
  }
};
const findChat = async (req, res) => {
  try {
    const { firstId, secondId } = req.params;
    const chat = await chatModel.findOne({
      members: { $all: [firstId, secondId] },
    });
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json(error);
  }
};
const findUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await userModel.findOne({ _id: userId });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
};
module.exports = {
  CreateChat,
  userChats,
  findChat,
  findUser,
};
