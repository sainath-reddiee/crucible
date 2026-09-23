import { SnowflakeDatabase, generateFull200SkillsLibrary, SEEDED_SKILLS } from '../../packages/core/dist/index.js';

const db = new SnowflakeDatabase();
const skills = generateFull200SkillsLibrary();

for (const skill of skills) {
  db.upsertSkill(skill);
}

const command = process.argv[2];
const query = process.argv[3];

async function handle() {
  if (command === 'list' || command === 'find') {
    const all = await db.listAllSkills();
    if (!query) {
      console.log(JSON.stringify(all));
      return;
    }
    const filtered = all.filter(s =>
      s.metadata.name.toLowerCase().includes(query.toLowerCase()) ||
      s.metadata.slug.toLowerCase().includes(query.toLowerCase()) ||
      s.metadata.description.toLowerCase().includes(query.toLowerCase())
    );
    console.log(JSON.stringify(filtered));
  } else if (command === 'get') {
    const skill = await db.getSkillBySlug(query) || await db.getSkillById(query);
    console.log(JSON.stringify(skill || null));
  }
}

handle().catch(err => {
  console.error(err);
  process.exit(1);
});
