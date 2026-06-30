import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const signup = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    email = email.toLowerCase().trim();
    name = name.trim();

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    // 1. Check fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    email = email.toLowerCase().trim();

    // 2. Check user exists
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`Login attempt failed: User not found for email ${email}`);
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // 3. Compare password
    if (!user.password) {
      console.log(`Login attempt failed: User ${email} exists but has no password field in DB.`);
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`Login attempt failed: Password mismatch for email ${email}`);
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    // 5. Send response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min

    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // email config (Gmail example)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset",
      html: `
        <h3>Reset Your Password</h3>
        <p>Click below link:</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `
    });

    res.json({
      success: true,
      message: "Reset link sent to email"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // 1. Send confirmation email to subscriber
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      to: email,
      subject: "Thank you for subscribing to SafarLink Newsletter!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #aa8453;">Welcome to SafarLink!</h2>
          <p>Thank you for subscribing to our newsletter. You will now receive exclusive travel offers, route updates, and premium travel packages directly in your inbox.</p>
          <p>Safe Travels,<br/><strong>The SafarLink Team</strong></p>
        </div>
      `
    });

    // 2. Send notification email to admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    await transporter.sendMail({
      to: adminEmail,
      subject: "New Newsletter Subscriber Alert",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #aa8453;">New Subscriber Alert</h2>
          <p>A new user has subscribed to the SafarLink newsletter:</p>
          <p><strong>Subscriber Email:</strong> ${email}</p>
        </div>
      `
    });

    res.status(200).json({ success: true, message: "Subscribed successfully" });

  } catch (error) {
    console.error("Newsletter Subscription error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const contactQuery = async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    if (!firstName || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "Required fields are missing" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const fullName = `${firstName} ${lastName || ""}`.trim();

    // 1. Send confirmation to user
    await transporter.sendMail({
      to: email,
      subject: `We received your message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #aa8453;">Hello ${fullName},</h2>
          <p>Thank you for reaching out to SafarLink. We have received your query regarding "<strong>${subject}</strong>".</p>
          <p>Our support team will review your message and get back to you shortly.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-style: italic; color: #666;">Your Message:<br/>"${message}"</p>
          <p>Safe Travels,<br/><strong>The SafarLink Team</strong></p>
        </div>
      `
    });

    // 2. Send alert to admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    await transporter.sendMail({
      to: adminEmail,
      subject: `New Contact Query: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #eee;">
          <h2 style="color: #aa8453; border-bottom: 2px solid #aa8453; padding-bottom: 10px;">New Contact Query Received</h2>
          <p><strong>From:</strong> ${fullName} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #fcfbf9; padding: 15px; border-left: 4px solid #aa8453; font-style: italic;">
            ${message}
          </div>
        </div>
      `
    });

    res.status(200).json({ success: true, message: "Message sent successfully" });

  } catch (error) {
    console.error("Contact Query Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};