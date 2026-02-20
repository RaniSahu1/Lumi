// import ImageKit from "imagekit"
import Chat from "../models/chat.js"
import User from "../models/user.js"
import axios from 'axios'
import openai from "../configs/openai.js"
import imagekit from "../configs/imagekit.js"

import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

//text based ai chat controller
export const textMessageController = async (req,res)=>{
    try {
        const userId  = req.user._id

        if(req.user.credits < 1){
            return res.json({success:false , message : "you dont have enough credits to use this feature"})
        }
        const {chatId, prompt} = req.body
        const chat = await Chat.findOne({userId, _id : chatId})
        if (!chat) {
  return res.status(404).json({
    success: false,
    message: "Chat not found or does not belong to user"
  });
}
        chat.messages.push({role : "user", content : prompt, timestamp : Date.now(),isImage : false})
        
        const {choices} = await openai.chat.completions.create({
    model: 'gemini-3-flash-preview',
    messages: [
        
        {
            role: 'user',
            content : prompt,
        }
    ]
});

const reply  = {...choices[0].message,timestamp : Date.now(),isImage : false}

res.json({success : true, reply})
chat.messages.push(reply)
await chat.save()

await User.updateOne({_id : userId}, {$inc : {credits : -1}})

    } catch (error) {
        res.json({success : false, message: error.message})
    }
}


// image generation message controller
console.log("REPLICATE TOKEN:", process.env.REPLICATE_API_TOKEN);

export const imageMessageController = async (req, res) => {
  try {

    const userId = req.user._id;

    if (req.user.credits < 2) {
      return res.json({
        success: false,
        message: "Not enough credits"
      });
    }

    const { prompt, chatId, isPublished } = req.body;

    const chat = await Chat.findOne({ userId, _id: chatId });

    if (!chat) {
      return res.json({
        success: false,
        message: "Chat not found"
      });
    }

    // save user message
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false
    });

    console.log("Generating FREE image using Picsum:", prompt);

    // ✅ FREE Picsum image URL
    const imageUrl =
      `https://picsum.photos/seed/${encodeURIComponent(prompt + Date.now())}/1024/1024`;

    console.log("FINAL IMAGE URL:", imageUrl);

    // save reply
    const reply = {
      role: "assistant",
      content: imageUrl,
      timestamp: Date.now(),
      isImage: true,
      isPublished
    };

    res.json({ success: true, reply });

    chat.messages.push(reply);

    await chat.save();

    await User.updateOne(
      { _id: userId },
      { $inc: { credits: -2 } }
    );

  } catch (error) {

    console.log("PICSUM ERROR:", error.message);

    res.json({
      success: false,
      message: error.message
    });

  }
};



