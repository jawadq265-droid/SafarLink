import Bus from "../models/bus.model.js";

const DEFAULT_ROUTES = [
  {
    name: "Safar Express (Executive)",
    route: "Lahore - Islamabad",
    from: "Lahore",
    to: "Islamabad",
    price: 1600,
    time: "08:00 AM",
    totalSeats: 40,
    seatsLeft: 32,
    status: "Active",
    isPopular: true,
    operator: "Daewoo Gold & Safar Express",
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop",
    busImage: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Safar Royal (VIP Sleeper)",
    route: "Karachi - Lahore",
    from: "Karachi",
    to: "Lahore",
    price: 4500,
    time: "10:30 PM",
    totalSeats: 30,
    seatsLeft: 18,
    status: "Active",
    isPopular: true,
    operator: "Safar Royal & Bilal Travels",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop",
    busImage: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Safar Mountain Cruiser",
    route: "Islamabad - Gilgit",
    from: "Islamabad",
    to: "Gilgit",
    price: 2800,
    time: "06:00 AM",
    totalSeats: 36,
    seatsLeft: 22,
    status: "Active",
    isPopular: true,
    operator: "Safar Mountain Cruiser",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop",
    busImage: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Bilal Travels (Business Class)",
    route: "Peshawar - Islamabad",
    from: "Peshawar",
    to: "Islamabad",
    price: 1200,
    time: "01:30 PM",
    totalSeats: 40,
    seatsLeft: 29,
    status: "Active",
    isPopular: true,
    operator: "Bilal Travels & Daewoo",
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop",
    busImage: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop"
  }
];

// Comprehensive delimiter regex for routes (supports ⇄, ↔, ⇌, ➔, ->, -->, –, —, -, to, /)
const ROUTE_DELIMITERS = /\s*(?:⇄|↔|⇌|➔|->|-->|–|—|-|\bto\b|\/)\s*/i;

export const parseRouteCities = (routeStr) => {
  if (!routeStr) return { from: "Lahore", to: "Islamabad" };
  const parts = routeStr.trim().split(ROUTE_DELIMITERS).filter(Boolean);
  const from = parts[0]?.trim() || "Lahore";
  const to = parts[1]?.trim() || "Islamabad";
  return { from, to };
};

// Helper to auto-seed default routes if collection is empty
const ensureSeedData = async () => {
  const count = await Bus.countDocuments();
  if (count === 0) {
    await Bus.insertMany(DEFAULT_ROUTES);
    console.log("Database seeded with initial authentic fleet routes.");
  }
};

// Sanitize and auto-heal any existing records where 'from' or 'to' was erroneously stored with delimiters
const sanitizeBusList = async (buses) => {
  for (const b of buses) {
    let needsUpdate = false;
    let newFrom = b.from;
    let newTo = b.to;

    if (!newFrom || ROUTE_DELIMITERS.test(newFrom)) {
      const parsed = parseRouteCities(newFrom || b.route);
      newFrom = parsed.from;
      if (!newTo || newTo === "Lahore" || newTo === newFrom || ROUTE_DELIMITERS.test(newTo)) {
        newTo = parsed.to;
      }
      needsUpdate = true;
    }

    if (needsUpdate) {
      b.from = newFrom;
      b.to = newTo;
      await Bus.findByIdAndUpdate(b._id, { from: newFrom, to: newTo });
    }
  }
};

export const getBuses = async (req, res) => {
  try {
    await ensureSeedData();
    const { status, isPopular, from, to } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (isPopular !== undefined) filter.isPopular = isPopular === "true";
    if (from) filter.from = new RegExp(from, "i");
    if (to) filter.to = new RegExp(to, "i");

    const buses = await Bus.find(filter).sort({ createdAt: -1 });
    await sanitizeBusList(buses);
    return res.status(200).json({ success: true, buses });
  } catch (error) {
    console.error("Error fetching buses:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPopularRoutes = async (req, res) => {
  try {
    await ensureSeedData();
    const routes = await Bus.find({ isPopular: true, status: "Active" }).sort({ createdAt: -1 });
    await sanitizeBusList(routes);
    return res.status(200).json({ success: true, routes });
  } catch (error) {
    console.error("Error fetching popular routes:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createBus = async (req, res) => {
  try {
    const { name, route, from, to, time, price, totalSeats, image, busImage, isPopular, operator, status } = req.body;

    if (!name || !route || !price) {
      return res.status(400).json({ success: false, message: "Service Name, Route, and Price are required." });
    }

    let resolvedFrom = from;
    let resolvedTo = to;
    if (!resolvedFrom || !resolvedTo || ROUTE_DELIMITERS.test(resolvedFrom)) {
      const parsed = parseRouteCities(resolvedFrom && ROUTE_DELIMITERS.test(resolvedFrom) ? resolvedFrom : route);
      resolvedFrom = parsed.from;
      resolvedTo = parsed.to;
    }

    const capacity = parseInt(totalSeats) || 40;

    const newBus = new Bus({
      name: name.trim(),
      route: route ? route.trim() : `${resolvedFrom} ⇄ ${resolvedTo}`,
      from: resolvedFrom,
      to: resolvedTo,
      time: time ? time.trim() : "08:00 AM",
      price: Number(price),
      totalSeats: capacity,
      seatsLeft: capacity,
      status: status || "Active",
      image: image || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop",
      busImage: busImage || "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop",
      isPopular: isPopular !== undefined ? Boolean(isPopular) : true,
      operator: operator || name.trim()
    });

    await newBus.save();
    return res.status(201).json({ success: true, bus: newBus });
  } catch (error) {
    console.error("Error creating route:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBus = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.route) {
      const parsed = parseRouteCities(updateData.route);
      updateData.from = parsed.from;
      updateData.to = parsed.to;
      updateData.route = updateData.route.trim();
    } else if (updateData.from && ROUTE_DELIMITERS.test(updateData.from)) {
      const parsed = parseRouteCities(updateData.from);
      updateData.from = parsed.from;
      updateData.to = parsed.to;
      updateData.route = updateData.from.trim();
    }

    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.totalSeats) {
      updateData.totalSeats = Number(updateData.totalSeats);
    }

    const updatedBus = await Bus.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedBus) {
      return res.status(404).json({ success: false, message: "Route not found" });
    }

    return res.status(200).json({ success: true, bus: updatedBus });
  } catch (error) {
    console.error("Error updating route:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBus = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBus = await Bus.findByIdAndDelete(id);
    if (!deletedBus) {
      return res.status(404).json({ success: false, message: "Route not found" });
    }

    return res.status(200).json({ success: true, message: "Route retired successfully" });
  } catch (error) {
    console.error("Error deleting route:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const togglePopularRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const bus = await Bus.findById(id);
    if (!bus) {
      return res.status(404).json({ success: false, message: "Route not found" });
    }

    bus.isPopular = !bus.isPopular;
    await bus.save();

    return res.status(200).json({
      success: true,
      message: `Route popular status changed to ${bus.isPopular ? "Popular" : "Standard"}`,
      isPopular: bus.isPopular,
      bus
    });
  } catch (error) {
    console.error("Error toggling popular status:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
