import User from "../models/user.model.js";
import Subscriber from "../models/subscriber.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

const createGmailTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

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

    // email config
    const transporter = createGmailTransporter();

    await transporter.sendMail({
      from: `"SafarLink" <${process.env.EMAIL_USER}>`,
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

const sendNewsletterEmails = async (email) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("[Newsletter] EMAIL_USER or EMAIL_PASS not configured in .env. Skipping email dispatch.");
    return { success: false, error: "EMAIL_USER or EMAIL_PASS not configured" };
  }

  try {
    const transporter = createGmailTransporter();

    // 1. Send confirmation email to subscriber
    await transporter.sendMail({
      from: `"SafarLink" <${process.env.EMAIL_USER}>`,
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
      from: `"SafarLink" <${process.env.EMAIL_USER}>`,
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

    console.log(`[Newsletter] Confirmation emails sent successfully to: ${email}`);
    return { success: true };
  } catch (mailError) {
    console.error("[Newsletter SMTP Error]: Could not dispatch email via nodemailer:", mailError.message);
    if (mailError.code === "EAUTH") {
      console.error("[Newsletter SMTP Error]: Invalid login credentials. Please verify EMAIL_PASS in your environment variables.");
    }
    return { success: false, error: mailError.message };
  }
};

const sendAlreadySubscribedEmail = async (email) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("[Newsletter] EMAIL_USER or EMAIL_PASS not configured in .env. Skipping email dispatch.");
    return { success: false, error: "EMAIL_USER or EMAIL_PASS not configured" };
  }

  try {
    const transporter = createGmailTransporter();

    // 1. Send friendly reminder to subscriber
    await transporter.sendMail({
      from: `"SafarLink" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "You're Already Subscribed to SafarLink Newsletter!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; color: #333; max-width: 600px; border: 1px solid #e0d0b8; border-radius: 8px;">
          <h2 style="color: #aa8453; margin-top: 0;">You're Already Subscribed!</h2>
          <p>Hello,</p>
          <p>We noticed you just requested to subscribe to the SafarLink newsletter with <strong>${email}</strong>.</p>
          <p>Good news: Your email is already active in our VIP subscriber list! You do not need to register again — you are already set up to receive our exclusive inter-city travel discounts, priority booking alerts, and route updates.</p>
          <hr style="border: 0; border-top: 1px solid #f0e6d6; margin: 20px 0;" />
          <p style="color: #666; font-size: 13px;">If you did not request this, you can safely disregard this message.</p>
          <p>Safe Travels,<br/><strong style="color: #aa8453;">The SafarLink Team</strong></p>
        </div>
      `
    });

    // 2. Alert admin that existing user attempted subscribe
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    if (adminEmail && adminEmail !== email) {
      await transporter.sendMail({
        from: `"SafarLink" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: "Newsletter Activity: Existing Subscriber Attempted Subscribe",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h3 style="color: #aa8453;">Existing Subscriber Activity</h3>
            <p>A user who is already subscribed (<strong>${email}</strong>) submitted the newsletter form again. A reminder email was sent to them.</p>
          </div>
        `
      });
    }

    console.log(`[Newsletter] Already-subscribed reminder email sent successfully to: ${email}`);
    return { success: true };
  } catch (mailError) {
    console.error("[Newsletter SMTP Error]: Could not dispatch reminder email:", mailError.message);
    if (mailError.code === "EAUTH") {
      console.error("[Newsletter SMTP Error]: Invalid login credentials. Please verify EMAIL_PASS in your environment variables.");
    }
    return { success: false, error: mailError.message };
  }
};

export const subscribeNewsletter = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    email = email.toLowerCase().trim();
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address" });
    }

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      // Send reminder email to user
      const mailStatus = await sendAlreadySubscribedEmail(email);

      return res.status(200).json({
        success: true,
        isAlreadySubscribed: true,
        emailSent: mailStatus?.success ?? false,
        emailError: mailStatus?.error || null,
        message: "You are already subscribed! We have sent a confirmation reminder to your email."
      });
    }

    // Save subscriber in DB
    await Subscriber.create({ email });

    const mailStatus = await sendNewsletterEmails(email);

    return res.status(200).json({
      success: true,
      isAlreadySubscribed: false,
      emailSent: mailStatus?.success ?? false,
      emailError: mailStatus?.error || null,
      message: "Subscribed successfully"
    });

  } catch (error) {
    console.error("Newsletter Subscription error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

export const clearSubscribers = async (req, res) => {
  try {
    const { email } = req.body;
    if (email) {
      await Subscriber.deleteMany({ email: email.toLowerCase().trim() });
      return res.status(200).json({ success: true, message: `Subscriber ${email} cleared successfully` });
    }
    await Subscriber.deleteMany({});
    return res.status(200).json({ success: true, message: "All subscribers cleared successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const contactQuery = async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    if (!firstName || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "Required fields are missing" });
    }

    const transporter = createGmailTransporter();

    const fullName = `${firstName} ${lastName || ""}`.trim();

    // 1. Send confirmation to user
    await transporter.sendMail({
      from: `"SafarLink" <${process.env.EMAIL_USER}>`,
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
      from: `"SafarLink" <${process.env.EMAIL_USER}>`,
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