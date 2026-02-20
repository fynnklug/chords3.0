import "dotenv/config";
import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "../src/lib/db/schema";

const db = drizzle(sql, { schema });

const songs = [
  {
    title: "Amazing Grace",
    artist: "John Newton",
    content: `[Verse 1]
Amazing grace how sweet the sound
That saved a wretch like me
I once was lost but now am found
Was blind but now I see

[Verse 2]
Twas grace that taught my heart to fear
And grace my fears relieved
How precious did that grace appear
The hour I first believed

[Chorus]
My chains are gone I've been set free
My God my Savior has ransomed me
And like a flood His mercy reigns
Unending love amazing grace`,
  },
  {
    title: "10.000 Reasons",
    artist: "Matt Redman",
    content: `[Chorus]
Bless the Lord O my soul
O my soul worship His holy name
Sing like never before O my soul
I'll worship Your holy name

[Verse 1]
The sun comes up it's a new day dawning
It's time to sing Your song again
Whatever may pass and whatever lies before me
Let me be singing when the evening comes

[Verse 2]
You're rich in love and You're slow to anger
Your name is great and Your heart is kind
For all Your goodness I will keep on singing
Ten thousand reasons for my heart to find`,
  },
  {
    title: "How Great Is Our God",
    artist: "Chris Tomlin",
    content: `[Verse 1]
The splendor of the King
Clothed in majesty
Let all the earth rejoice
All the earth rejoice

[Verse 2]
He wraps Himself in light
And darkness tries to hide
And trembles at His voice
Trembles at His voice

[Chorus]
How great is our God
Sing with me how great is our God
And all will see how great
How great is our God`,
  },
  {
    title: "Oceans",
    artist: "Hillsong United",
    content: `[Verse 1]
You call me out upon the waters
The great unknown where feet may fail
And there I find You in the mystery
In oceans deep my faith will stand

[Chorus]
And I will call upon Your name
And keep my eyes above the waves
When oceans rise
My soul will rest in Your embrace
For I am Yours and You are mine

[Verse 2]
Your grace abounds in deepest waters
Your sovereign hand will be my guide
Where feet may fail and fear surrounds me
You've never failed and You won't start now`,
  },
  {
    title: "Good Good Father",
    artist: "Chris Tomlin",
    content: `[Verse 1]
I've heard a thousand stories
Of what they think You're like
But I've heard the tender whisper
Of love in the dead of night

[Chorus]
You're a good good Father
It's who You are it's who You are
And I'm loved by You
It's who I am it's who I am

[Verse 2]
I've seen many searching for answers
Far and wide
But I know we're all searching for answers
Only You provide`,
  },
  {
    title: "Reckless Love",
    artist: "Cory Asbury",
    content: `[Verse 1]
Before I spoke a word You were singing over me
You have been so so good to me
Before I took a breath You breathed Your life in me
You have been so so kind to me

[Chorus]
O the overwhelming never-ending reckless love of God
O it chases me down fights til I'm found
Leaves the ninety-nine
I couldn't earn it I don't deserve it
Still You give Yourself away

[Verse 2]
When I was Your foe still Your love fought for me
You have been so so good to me
When I felt no worth You paid it all for me
You have been so so kind to me`,
  },
];

async function seed() {
  console.log("Seeding songs...");
  for (const song of songs) {
    await db.insert(schema.lieder).values(song);
  }
  console.log(`Seeded ${songs.length} songs.`);
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  });
