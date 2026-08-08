import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { UserStore } from '../models/User.js';
import { CurriculumProgressStore } from '../models/CurriculumProgress.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedPredefinedCandidates() {
  try {
    const candidatesPath = path.join(__dirname, '../data/candidates.json');
    if (!fs.existsSync(candidatesPath)) return;

    const data = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'));
    const candidates = data.candidates || [];

    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    for (const c of candidates) {
      const member = c.member;
      if (!member || !member.id) continue;

      const firstName = member.name.split(' ')[0].toLowerCase();
      const fullNameClean = member.name.toLowerCase().replace(/[^a-z0-9]/g, '');

      const emailsToSeed = [
        `${fullNameClean}@intervai.ai`,
        `${firstName}@intervai.ai`
      ];

      for (const email of emailsToSeed) {
        const existing = await UserStore.findByEmail(email);

        if (!existing) {
          const user = await UserStore.create({
            id: email === `${firstName}@intervai.ai` ? `${member.id}-short` : member.id,
            name: member.name,
            email,
            passwordHash: defaultPasswordHash,
            jobRole: member.jobRole || 'AI Engineer',
            yearsExperience: member.yearsExperience || 4,
            education: member.education || 'Computer Science',
            onboardingCompleted: true
          });

          // Seed curriculum progress from candidate.json missions
          const progressItems = (c.missions || []).map(m => ({
            curriculumDay: m.day,
            topic: m.title,
            status: m.passed ? 'COMPLETED' : m.skipped ? 'SKIPPED' : 'ATTEMPTED',
            experienceLevel: 'Comfortable',
            practicalExperience: 'Built a project',
            attempts: m.attempts || 1,
            confidence: m.passed ? 4 : 2
          }));

          await CurriculumProgressStore.saveUserProgress(user.id, progressItems);
          console.log(`[Seed] Seeded predefined candidate account: ${user.name} (${user.email})`);
        } else {
          // Always ensure valid password hash on seeded demo accounts
          existing.passwordHash = defaultPasswordHash;
          await UserStore.create(existing);
        }
      }
    }
  } catch (err) {
    console.warn('[Seed] Notice during predefined candidate seeding:', err.message);
  }
}
