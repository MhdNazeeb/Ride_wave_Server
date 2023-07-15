const chatModel = require("../../models/Chat");

export const CreateChat = async (req, res) => {
  const { senderId, receiverid } = req.body;
  try {
    const newChat = await chatModel.create({
      members: [senderId, receiverid],
    });
    res.status(200).json(newChat);
  } catch (error) {
    console.log(error.message);
    res.status(500).json();
  }
};
export const userChats = async (req, res) => {
  const { userid } = req.body;
  try {
    const chat = await chatModel.find({ members: { $in: [userid] } });
  } catch (error) {
    res.status(500).json(error);
  }
};
export const findChat = async (req, res) => {
  try {
    const { fristId, secondId } = req.params;
    const chat = await chatModel.findOne({
      members: { $all: [fristId, secondId] }});

  } catch (error) {
    res.statu(200).json(error);
  }
};
