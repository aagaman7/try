const Goal = require("../models/GoalModel");

exports.createGoal = async (req, res) => {
  try {
    const { name, description, category } = req.body;

    const newGoal = new Goal({
      name, 
      description, 
      category
    });

    await newGoal.save();
    res.status(201).json(newGoal);
  } catch (error) {
    res.status(500).json({ message: "Error creating goal", error: error.message });
  }
};

exports.getAllGoals = async (req, res) => {
  try {
    const { active, category } = req.query;
    const query = {};
    
    if (active !== undefined) query.active = active === 'true';
    if (category) query.category = category;

    const goals = await Goal.find(query)
      .sort({ createdAt: -1 });
    
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving goals", error: error.message });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { name, description, category, active } = req.body;

    const updatedGoal = await Goal.findByIdAndUpdate(
      goalId, 
      { name, description, category, active },
      { new: true }
    );

    if (!updatedGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ message: "Error updating goal", error: error.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const deletedGoal = await Goal.findByIdAndDelete(goalId);

    if (!deletedGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json({ message: "Goal deleted successfully", deletedGoal });
  } catch (error) {
    res.status(500).json({ message: "Error deleting goal", error: error.message });
  }
};