// ============================================================================
// frontend/src/data/toeic-questions.data.ts
// คลังข้อสอบ TOEIC มาตรฐาน 7 พาร์ท (484 Questions)
// แยกเฉพาะข้อมูลข้อสอบ เพื่อให้หน้าคำศัพท์หรือแดชบอร์ดไม่ต้องโหลดข้อมูลชุดนี้
// ============================================================================

import toeicQuestionsJson from './toeic-questions.json';
import { QuestionItem } from './toeic-types';

export const TOEIC_INITIAL_QUESTIONS: QuestionItem[] =
  toeicQuestionsJson as QuestionItem[];
