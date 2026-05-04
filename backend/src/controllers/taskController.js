// controllers/taskController.js

export const verifyHandover = async (req, res) => {
  const { taskId, inputPin } = req.body;

  // 1. Find the task
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { dispatcher: true }
  });

  // 2. Check if the PIN matches
  if (task.handoverPin !== inputPin) {
    return res.status(400).json({ message: "Incorrect PIN. Please check with the receiver." });
  }

  // 3. If match, use a Transaction to update everything safely
  try {
    await prisma.$transaction([
      // Mark task as completed
      prisma.task.update({
        where: { id: taskId },
        data: { status: 'COMPLETED' }
      }),
      // Move the earned money to the dispatcher's "Savings"
      prisma.user.update({
        where: { id: task.dispatcherId },
        data: { 
          weeklyBalance: { increment: task.dispatcherEarned } 
        }
      })
    ]);

    res.status(200).json({ message: "Delivery Confirmed! Funds added to your balance." });
  } catch (error) {
    res.status(500).json({ message: "Transaction failed." });
  }
};