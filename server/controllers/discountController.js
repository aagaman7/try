const Discount = require("../models/DiscountModel");

exports.createDiscount = async (req, res) => {
  try {
    const { name, percentage, paymentInterval } = req.body;

    const newDiscount = new Discount({
      name, 
      percentage, 
      paymentInterval
    });

    await newDiscount.save();
    res.status(201).json(newDiscount);
  } catch (error) {
    res.status(500).json({ message: "Error creating discount", error: error.message });
  }
};

exports.getAllDiscounts = async (req, res) => {
  try {
    const { active, paymentInterval } = req.query;
    const query = {};
    
    if (active !== undefined) query.active = active === 'true';
    if (paymentInterval) query.paymentInterval = paymentInterval;

    const discounts = await Discount.find(query)
      .sort({ createdAt: -1 });
    
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving discounts", error: error.message });
  }
};

exports.updateDiscount = async (req, res) => {
  try {
    const { discountId } = req.params;
    const { name, percentage, paymentInterval, active } = req.body;

    const updatedDiscount = await Discount.findByIdAndUpdate(
      discountId, 
      { name, percentage, paymentInterval, active },
      { new: true }
    );

    if (!updatedDiscount) {
      return res.status(404).json({ message: "Discount not found" });
    }

    res.json(updatedDiscount);
  } catch (error) {
    res.status(500).json({ message: "Error updating discount", error: error.message });
  }
};

exports.deleteDiscount = async (req, res) => {
  try {
    const { discountId } = req.params;
    const deletedDiscount = await Discount.findByIdAndDelete(discountId);

    if (!deletedDiscount) {
      return res.status(404).json({ message: "Discount not found" });
    }

    res.json({ message: "Discount deleted successfully", deletedDiscount });
  } catch (error) {
    res.status(500).json({ message: "Error deleting discount", error: error.message });
  }
};