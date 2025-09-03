import { mongoose } from "mongoose";
const DepositionSchema = new mongoose.Schema(
  {
    model: { type: String, required: true },
    inventoryName: { type: String, required: true },
    inventoryString: { type: String, required: false },
    quantity: { type: Number, required: false },
    serialNumber: { type: String, required: false },
    //userId: { type: Number, required: false },
    //
    type: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

DepositionSchema.pre("save", async function (next) {
  try {
    if (!this.inventoryString) {
      let criteria = "";
      if (this.type === "inventory") {
        if (this.quantity) criteria = "Q";
        if (this.serialNumber) criteria = "SN";
      }
      this.inventoryString = await generateDepositionNumber(
        this._id,
        this.type,
        criteria
      ); // use model context
    }
    next();
  } catch (error) {
    next(error);
  }
});

//compare password

DepositionSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//auto ID
async function generateDepositionNumber(id, type, criteria) {
  //const count = await DepositionModel.countDocuments();
  const buffer =
    id instanceof mongoose.Types.ObjectId
      ? id.id
      : new mongoose.Types.ObjectId(id).id;

  const counterHex = buffer.slice(9, 12).toString("hex");
  const counter = parseInt(counterHex, 16); // full 3-byte counter
  const pre = type.slice(0, 3);
  let string = pre.toUpperCase() + "-";
  if (pre === "inv" || pre === "INV") {
    string += criteria + "-";
  }
  let today = new Date();
  const now = new Date();
  today =
    now.toISOString().split("T")[0] +
    "-" +
    String(now.getHours()).padStart(2, "0") +
    ":" +
    String(now.getMinutes()).padStart(2, "0");

  console.log(today); // e.g., "2025-08-19"
  string += counter.toString().padStart(9, "0") + "-" + today;
  //if(type==="movment")
  return string;
}
//export function get_generatedDepositionNumber(num) {
//  return "deposition-" + num.toString().padStart(16, "0");
//}

const Deposition = mongoose.model("deposition", DepositionSchema);
export default Deposition;
