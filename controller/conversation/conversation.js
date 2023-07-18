const messageModel = require("../../models/Message");

const addMessage = async (req, res) => {
  const { senderId, chatId, text } = req.body;
  console.log(senderId, chatId, text,'fffffffffff');
  try {
    const result = await messageModel.create({
      senderId,
      chatId,
      text,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const result = await messageModel.find({ chatId });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  addMessage,
  getMessages,
};
