// ============================================================================
// frontend/src/utils/number-format.util.ts
// CardCraft v2.0 - Number & Decimal Formatting Utility
// กฎการแสดงผลตัวเลขทศนิยม: จำกัดทศนิยมไม่เกิน 3 หลักทั่วทั้งระบบ (Max 3 Decimals)
// ============================================================================

/**
 * จัดรูปแบบตัวเลขให้จำกัดทศนิยมไม่เกิน maxDecimals (ค่าเริ่มต้น 3 หลัก)
 * - หากมีทศนิยมเกิน 3 หลัก จะถูกปัดเศษให้อยู่ใน 3 หลัก (เช่น 66.66667 -> "66.667")
 * - ไม่แสดงเลข 0 ที่ไม่จำเป็นหลังจุดทศนิยม (เช่น 12.500 -> "12.5", 5.000 -> "5")
 * - รองรับทั้ง number, string, null, undefined อย่างปลอดภัย
 */
export function formatDecimal(
  val: number | string | null | undefined,
  maxDecimals = 3,
): string {
  if (val === null || val === undefined || val === '') return '0';
  const num = typeof val === 'number' ? val : Number(val);
  if (!Number.isFinite(num)) return '0';

  // ปัดเศษให้อยู่ในกรอบ maxDecimals และตัดศูนย์ส่วนเกิน
  return Number(num.toFixed(maxDecimals)).toString();
}

/**
 * จัดรูปแบบค่าความแม่นยำ (Accuracy / Rate)
 * - หากค่าที่ส่งมาเป็นอัตราส่วน (0.0 - 1.0) จะคูณ 100 ให้เป็นเปอร์เซ็นต์อัตโนมัติ
 * - หากเป็นเปอร์เซ็นต์อยู่แล้ว (0 - 100) จะรักษาค่าเดิม
 * - จำกัดทศนิยมไม่เกิน maxDecimals (ค่าเริ่มต้น 3 หลัก)
 */
export function formatAccuracyPercent(
  accuracy: number | string | null | undefined,
  maxDecimals = 3,
): string {
  if (accuracy === null || accuracy === undefined || accuracy === '') return '0';
  const num = typeof accuracy === 'number' ? accuracy : Number(accuracy);
  if (!Number.isFinite(num)) return '0';

  // หากเป็นอัตราส่วน 0.0 - 1.0 (เช่น 0.666667) ให้แปลงเป็น % (66.667)
  const percent = num <= 1.0 && num > 0 ? num * 100 : num;
  return formatDecimal(percent, maxDecimals);
}

/**
 * จัดรูปแบบเปอร์เซ็นต์พร้อมเครื่องหมาย %
 * เช่น formatPercent(66.66667) -> "66.667%"
 */
export function formatPercent(
  val: number | string | null | undefined,
  maxDecimals = 3,
): string {
  return `${formatDecimal(val, maxDecimals)}%`;
}
