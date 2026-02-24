import { User } from "../models.js";

export const createUser = async (req, res) => {
  try {
    const { email } = req.body;

    // 🔎 Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(201).json({
        success: true,
        data: existingUser,
      });
    }

    // Create new user
    const userData = {
      ...req.body,
      credits: 0,
    };



    const user = await User.create(userData);
    console.log(user)

    res.status(201).json({
      success: true,
      data: user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



/* =========================
   ADD CREDITS
========================= */
export const addCredits = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0"
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { credits: amount } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "Credits added successfully",
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/* =========================
   REMOVE / DEDUCT CREDITS
========================= */
export const removeCredits = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.credits < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient credits"
      });
    }

    user.credits -= amount;
    await user.save();

    res.json({
      success: true,
      message: "Credits deducted successfully",
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};