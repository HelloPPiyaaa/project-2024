const express = require("express");
const chatModel = require("../models/chat");
const router = express.Router();
const messageModel = require("../models/message");

router.post("/", async (req, res) => {
  const { firstId, secondId } = req.body;

  try {
    // ตรวจสอบแชทที่มีอยู่
    const existingChat = await chatModel.findOne({
      members: { $all: [firstId, secondId] },
    });

    if (existingChat) {
      // รีเซ็ต deletedBy ถ้ามีค่า
      existingChat.deletedBy = {};
      await existingChat.save();
      return res.status(200).json(existingChat);
    }

    // สร้างแชทใหม่
    const newChat = new chatModel({
      members: [firstId, secondId],
      deletedBy: {}, // กำหนดเป็น {} สำหรับแชทที่สร้างใหม่
    });

    const response = await newChat.save();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/:access_token", async (req, res) => {
  const access_token = req.params.access_token;

  try {
    const chats = await chatModel.find({
      members: { $in: [access_token] },
      $or: [
        { deletedBy: { $exists: false } }, // ตรวจสอบว่า deletedBy ไม่มีการตั้งค่า
        { [`deletedBy.${access_token}`]: { $exists: false } }, // ตรวจสอบว่า deletedBy สำหรับผู้ใช้ไม่มีการตั้งค่า
      ],
    });
    res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/find/:firstId/:secondId", async (req, res) => {
  const { firstId, secondId } = req.params;

  try {
    const chat = await chatModel.find({
      members: { $all: [firstId, secondId] },
    });

    res.status(200).json(chat);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post("/delete", async (req, res) => {
  const { chatId, access_token } = req.body;

  if (!chatId || !access_token) {
    return res
      .status(400)
      .json({ message: "Chat ID and User ID are required" });
  }

  try {
    // อัพเดตแชทเพื่อทำเครื่องหมายว่าถูกลบโดยผู้ใช้
    const result = await chatModel.updateOne(
      { _id: chatId },
      { $set: { [`deletedBy.${access_token}`]: true } }
    );

    if (result.nModified === 0) {
      return res
        .status(404)
        .json({ message: "Chat not found or already deleted" });
    }

    res.status(200).json({ message: "Chat marked as deleted for user" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
