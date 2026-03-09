import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { source } = await req.json();
    const results: Record<string, number> = {};

    // 1. UNIVERSITIES from Hipo Labs (9600+ worldwide)
    if (!source || source === "universities") {
      const countries = [
        "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria","Azerbaijan",
        "Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia",
        "Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon",
        "Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica",
        "Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominican Republic","Ecuador","Egypt",
        "El Salvador","Eritrea","Estonia","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia",
        "Germany","Ghana","Greece","Guatemala","Guinea","Guyana","Haiti","Honduras","Hong Kong","Hungary",
        "Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan",
        "Kazakhstan","Kenya","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya",
        "Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta",
        "Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique",
        "Myanmar","Namibia","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Macedonia",
        "Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines",
        "Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saudi Arabia","Senegal","Serbia","Sierra Leone",
        "Singapore","Slovakia","Slovenia","Somalia","South Africa","South Korea","Spain","Sri Lanka","Sudan",
        "Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Togo","Trinidad and Tobago",
        "Tunisia","Turkey","Turkmenistan","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States",
        "Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
      ];

      let totalUnis = 0;
      for (const country of countries) {
        try {
          const resp = await fetch(`http://universities.hipolabs.com/search?country=${encodeURIComponent(country)}`);
          if (!resp.ok) continue;
          const unis = await resp.json();
          
          if (unis.length > 0) {
            const continent = getContinent(country);
            const rows = unis.map((u: any) => ({
              name: u.name,
              country: u.country || country,
              city: null,
              continent,
              type: 'Unknown',
              ranking_tier: null,
              website: u.web_pages?.[0] || u.domains?.[0] ? `https://${u.domains[0]}` : null,
              keywords: [
                ...(u.name?.split(/[\s,]+/).filter((w: string) => w.length > 2).slice(0, 5) || []),
                country.toLowerCase(),
                continent.toLowerCase()
              ],
            }));

            // Upsert in batches of 100
            for (let i = 0; i < rows.length; i += 100) {
              const batch = rows.slice(i, i + 100);
              await supabase.from("universities_directory").upsert(batch, { 
                onConflict: "name",
                ignoreDuplicates: true 
              });
            }
            totalUnis += unis.length;
          }
          
          // Rate limit - small delay between countries
          await new Promise(r => setTimeout(r, 100));
        } catch (e) {
          console.error(`Failed for ${country}:`, e);
        }
      }
      results.universities = totalUnis;
    }

    // 2. ESCO OCCUPATIONS (3000+ from European Commission)
    if (!source || source === "occupations") {
      try {
        const escoResp = await fetch(
          "https://ec.europa.eu/esco/api/resource/taxonomy?uri=http://data.europa.eu/esco/concept-scheme/occupations&language=en&selectedVersion=v1.2.0",
          { headers: { Accept: "application/json" } }
        );
        
        if (escoResp.ok) {
          const escoData = await escoResp.json();
          // Get top-level ISCO groups
          const topConcepts = escoData?._links?.hasTopConcept || [];
          let occupationCount = 0;
          
          for (const concept of topConcepts.slice(0, 50)) {
            try {
              const conceptResp = await fetch(
                `https://ec.europa.eu/esco/api/resource/concept?uri=${encodeURIComponent(concept.uri)}&language=en&selectedVersion=v1.2.0`,
                { headers: { Accept: "application/json" } }
              );
              if (!conceptResp.ok) continue;
              const conceptData = await conceptResp.json();
              
              const title = conceptData.preferredLabel?.en || conceptData.title || "";
              const description = conceptData.description?.en?.literal || "";
              
              if (title) {
                await supabase.from("job_roles_directory").upsert({
                  title,
                  domain: mapEscoToOurDomain(title),
                  description: description.slice(0, 500),
                  seniority_levels: ["Entry", "Mid", "Senior"],
                  keywords: [title.toLowerCase(), ...title.split(/[\s,]+/).filter((w: string) => w.length > 2)],
                  career_path_keywords: [mapEscoToOurDomain(title)],
                }, { onConflict: "title,domain", ignoreDuplicates: true });
                occupationCount++;
              }
              
              // Get narrower concepts (sub-occupations)
              const narrower = conceptData?._links?.narrowerConcept || [];
              for (const sub of narrower.slice(0, 20)) {
                try {
                  const subResp = await fetch(
                    `https://ec.europa.eu/esco/api/resource/concept?uri=${encodeURIComponent(sub.uri)}&language=en&selectedVersion=v1.2.0`,
                    { headers: { Accept: "application/json" } }
                  );
                  if (!subResp.ok) continue;
                  const subData = await subResp.json();
                  const subTitle = subData.preferredLabel?.en || "";
                  const subDesc = subData.description?.en?.literal || "";
                  
                  if (subTitle) {
                    await supabase.from("job_roles_directory").upsert({
                      title: subTitle,
                      domain: mapEscoToOurDomain(subTitle),
                      description: subDesc.slice(0, 500),
                      seniority_levels: ["Entry", "Mid", "Senior"],
                      keywords: [subTitle.toLowerCase(), ...subTitle.split(/[\s,]+/).filter((w: string) => w.length > 2)],
                      career_path_keywords: [mapEscoToOurDomain(subTitle)],
                    }, { onConflict: "title,domain", ignoreDuplicates: true });
                    occupationCount++;
                  }
                  await new Promise(r => setTimeout(r, 50));
                } catch {}
              }
              await new Promise(r => setTimeout(r, 100));
            } catch {}
          }
          results.esco_occupations = occupationCount;
        }
      } catch (e) {
        console.error("ESCO fetch failed:", e);
      }
    }

    // 3. EXPAND DOMAINS with comprehensive coverage
    if (!source || source === "domains") {
      const extraDomains = getExhaustiveDomains();
      for (let i = 0; i < extraDomains.length; i += 50) {
        const batch = extraDomains.slice(i, i + 50);
        await supabase.from("domain_directory").upsert(batch, { onConflict: "name", ignoreDuplicates: true });
      }
      results.domains_added = extraDomains.length;
    }

    // 4. EXPAND JOB ROLES with comprehensive coverage
    if (!source || source === "job_roles") {
      const extraRoles = getExhaustiveJobRoles();
      for (let i = 0; i < extraRoles.length; i += 50) {
        const batch = extraRoles.slice(i, i + 50);
        await supabase.from("job_roles_directory").insert(batch).select();
      }
      results.job_roles_added = extraRoles.length;
    }

    // 5. EXPAND CAREER PATHS
    if (!source || source === "career_paths") {
      const extraPaths = getExhaustiveCareerPaths();
      for (let i = 0; i < extraPaths.length; i += 50) {
        const batch = extraPaths.slice(i, i + 50);
        await supabase.from("career_paths").upsert(batch, { onConflict: "title,domain", ignoreDuplicates: true });
      }
      results.career_paths_added = extraPaths.length;
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Ingestion error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getContinent(country: string): string {
  const map: Record<string, string[]> = {
    "Asia": ["Afghanistan","Bahrain","Bangladesh","Bhutan","Brunei","Cambodia","China","Hong Kong","India","Indonesia","Iran","Iraq","Israel","Japan","Jordan","Kazakhstan","Kuwait","Kyrgyzstan","Laos","Lebanon","Malaysia","Maldives","Mongolia","Myanmar","Nepal","North Korea","Oman","Pakistan","Palestine","Philippines","Qatar","Russia","Saudi Arabia","Singapore","South Korea","Sri Lanka","Syria","Taiwan","Tajikistan","Thailand","Turkmenistan","United Arab Emirates","Uzbekistan","Vietnam","Yemen"],
    "Europe": ["Albania","Andorra","Armenia","Austria","Azerbaijan","Belarus","Belgium","Bosnia and Herzegovina","Bulgaria","Croatia","Cyprus","Czech Republic","Denmark","Estonia","Finland","France","Georgia","Germany","Greece","Hungary","Iceland","Ireland","Italy","Latvia","Liechtenstein","Lithuania","Luxembourg","Malta","Moldova","Monaco","Montenegro","Netherlands","North Macedonia","Norway","Poland","Portugal","Romania","Serbia","Slovakia","Slovenia","Spain","Sweden","Switzerland","Turkey","Ukraine","United Kingdom"],
    "Africa": ["Algeria","Angola","Benin","Botswana","Burkina Faso","Burundi","Cameroon","Central African Republic","Chad","Comoros","Congo","Djibouti","Egypt","Eritrea","Ethiopia","Gabon","Gambia","Ghana","Guinea","Kenya","Lesotho","Liberia","Libya","Madagascar","Malawi","Mali","Mauritania","Mauritius","Morocco","Mozambique","Namibia","Niger","Nigeria","Rwanda","Senegal","Sierra Leone","Somalia","South Africa","Sudan","Tanzania","Togo","Tunisia","Uganda","Zambia","Zimbabwe"],
    "North America": ["Bahamas","Barbados","Belize","Canada","Costa Rica","Cuba","Dominican Republic","El Salvador","Guatemala","Haiti","Honduras","Jamaica","Mexico","Nicaragua","Panama","Trinidad and Tobago","United States"],
    "South America": ["Argentina","Bolivia","Brazil","Chile","Colombia","Ecuador","Guyana","Paraguay","Peru","Suriname","Uruguay","Venezuela"],
    "Oceania": ["Australia","Fiji","New Zealand","Papua New Guinea"],
  };
  for (const [cont, countries] of Object.entries(map)) {
    if (countries.includes(country)) return cont;
  }
  return "Other";
}

function mapEscoToOurDomain(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("software") || t.includes("developer") || t.includes("programmer") || t.includes("IT")) return "Technology";
  if (t.includes("engineer")) return "Engineering";
  if (t.includes("doctor") || t.includes("nurse") || t.includes("medical") || t.includes("health")) return "Healthcare";
  if (t.includes("teacher") || t.includes("professor") || t.includes("education")) return "Education";
  if (t.includes("design") || t.includes("architect")) return "Design";
  if (t.includes("market") || t.includes("sales") || t.includes("business")) return "Business";
  if (t.includes("law") || t.includes("legal") || t.includes("judge")) return "Law";
  if (t.includes("art") || t.includes("music") || t.includes("creative")) return "Creative Arts";
  if (t.includes("farm") || t.includes("agri")) return "Agriculture";
  if (t.includes("cook") || t.includes("chef") || t.includes("hotel")) return "Hospitality";
  if (t.includes("finance") || t.includes("account") || t.includes("bank")) return "Finance";
  if (t.includes("science") || t.includes("research") || t.includes("lab")) return "Science";
  return "General";
}

function getExhaustiveDomains() {
  return [
    { name: "Actuarial Science", category: "Business", description: "Mathematical and statistical methods to assess risk in insurance and finance", icon_emoji: "📐", keywords: ["actuarial","risk","insurance","statistics","probability"] },
    { name: "Advertising", category: "Business", description: "Creating and managing promotional campaigns for products and services", icon_emoji: "📺", keywords: ["advertising","campaigns","media buying","creative"] },
    { name: "Anthropology", category: "Social Sciences", description: "Study of human societies, cultures, and their development", icon_emoji: "🏺", keywords: ["anthropology","culture","ethnography","human evolution"] },
    { name: "Applied Mathematics", category: "Science & Nature", description: "Using mathematical methods to solve practical problems", icon_emoji: "➗", keywords: ["applied math","modeling","optimization","numerical analysis"] },
    { name: "Aquaculture", category: "Agriculture", description: "Breeding and harvesting fish and aquatic organisms", icon_emoji: "🐟", keywords: ["aquaculture","fish farming","aquatic","mariculture"] },
    { name: "Archaeology", category: "Humanities", description: "Study of human history through material remains and artifacts", icon_emoji: "🏛️", keywords: ["archaeology","excavation","artifacts","ancient history"] },
    { name: "Art History", category: "Humanities", description: "Study of visual arts in historical and cultural context", icon_emoji: "🖼️", keywords: ["art history","visual arts","museums","critique"] },
    { name: "Audiology", category: "Healthcare", description: "Diagnosis and treatment of hearing and balance disorders", icon_emoji: "👂", keywords: ["audiology","hearing","balance","audiometry"] },
    { name: "Bioinformatics", category: "Technology", description: "Applying computational methods to biological data", icon_emoji: "🧬", keywords: ["bioinformatics","genomics","computational biology","sequencing"] },
    { name: "Cartography", category: "Science & Nature", description: "The art and science of making maps", icon_emoji: "🗺️", keywords: ["cartography","maps","GIS","spatial analysis"] },
    { name: "Ceramic Engineering", category: "Engineering", description: "Design and manufacture of ceramic materials and products", icon_emoji: "🏺", keywords: ["ceramics","materials","kilns","glass"] },
    { name: "Chiropractic", category: "Healthcare", description: "Diagnosis and treatment of musculoskeletal disorders", icon_emoji: "🦴", keywords: ["chiropractic","spine","musculoskeletal","adjustment"] },
    { name: "Cinematography", category: "Creative Arts", description: "Art of motion picture photography and visual storytelling", icon_emoji: "🎞️", keywords: ["cinematography","camera","film","visual storytelling"] },
    { name: "Cognitive Science", category: "Science & Nature", description: "Interdisciplinary study of the mind and intelligence", icon_emoji: "🧩", keywords: ["cognitive science","mind","intelligence","perception","cognition"] },
    { name: "Comparative Literature", category: "Humanities", description: "Study of literature across different cultures and languages", icon_emoji: "📚", keywords: ["literature","comparative","languages","criticism"] },
    { name: "Computational Linguistics", category: "Technology", description: "Using computers to process and analyze natural language", icon_emoji: "💬", keywords: ["NLP","computational linguistics","text mining","language models"] },
    { name: "Cosmetic Science", category: "Science & Nature", description: "Development and formulation of cosmetic and beauty products", icon_emoji: "💄", keywords: ["cosmetics","formulation","beauty","skincare"] },
    { name: "Counseling Psychology", category: "Healthcare", description: "Therapeutic support for emotional and psychological wellbeing", icon_emoji: "💛", keywords: ["counseling","therapy","emotional health","support"] },
    { name: "Criminal Justice", category: "Law", description: "Study of the criminal justice system and law enforcement", icon_emoji: "🚔", keywords: ["criminal justice","law enforcement","corrections","criminology"] },
    { name: "Cryptography", category: "Technology", description: "Secure communication through mathematical techniques", icon_emoji: "🔑", keywords: ["cryptography","encryption","security","blockchain"] },
    { name: "Dance", category: "Creative Arts", description: "Performance art involving body movement and choreography", icon_emoji: "💃", keywords: ["dance","choreography","ballet","contemporary","performance"] },
    { name: "Data Engineering", category: "Technology", description: "Building systems to collect, store, and analyze data at scale", icon_emoji: "🔧", keywords: ["data engineering","pipelines","ETL","data warehousing"] },
    { name: "Dermatology", category: "Healthcare", description: "Medical specialty dealing with skin conditions", icon_emoji: "🧴", keywords: ["dermatology","skin","cosmetic","treatment"] },
    { name: "Disability Studies", category: "Social Sciences", description: "Examining disability as a social, cultural, and political phenomenon", icon_emoji: "♿", keywords: ["disability","accessibility","inclusion","advocacy"] },
    { name: "Early Childhood Education", category: "Education", description: "Education and development of children from birth to age eight", icon_emoji: "🧒", keywords: ["early childhood","preschool","child development","pedagogy"] },
    { name: "Ecotourism", category: "Hospitality", description: "Responsible travel to natural areas that conserves the environment", icon_emoji: "🌿", keywords: ["ecotourism","sustainable travel","conservation","nature"] },
    { name: "Embedded Systems", category: "Technology", description: "Computer systems designed for specific control functions", icon_emoji: "🔌", keywords: ["embedded","IoT","microcontrollers","firmware","hardware"] },
    { name: "Emergency Medicine", category: "Healthcare", description: "Medical specialty for acute illnesses and injuries", icon_emoji: "🚑", keywords: ["emergency","trauma","acute care","ER"] },
    { name: "Endocrinology", category: "Healthcare", description: "Study and treatment of hormonal disorders", icon_emoji: "🧪", keywords: ["endocrinology","hormones","thyroid","diabetes"] },
    { name: "Epidemiology", category: "Healthcare", description: "Study of disease distribution and determinants in populations", icon_emoji: "📊", keywords: ["epidemiology","disease","public health","outbreak"] },
    { name: "Ethology", category: "Science & Nature", description: "Scientific study of animal behavior", icon_emoji: "🐾", keywords: ["ethology","animal behavior","zoology","behavioral science"] },
    { name: "Film Studies", category: "Humanities", description: "Academic study of cinema and film", icon_emoji: "🎬", keywords: ["film studies","cinema","criticism","theory"] },
    { name: "Fine Arts", category: "Creative Arts", description: "Visual arts created primarily for aesthetic purposes", icon_emoji: "🎨", keywords: ["fine arts","painting","sculpture","gallery"] },
    { name: "Fisheries Science", category: "Science & Nature", description: "Study of fisheries management and aquatic resources", icon_emoji: "🎣", keywords: ["fisheries","aquatic resources","marine management"] },
    { name: "Floristry", category: "Creative Arts", description: "Art and business of flower arrangement and floral design", icon_emoji: "💐", keywords: ["floristry","flowers","floral design","arrangement"] },
    { name: "Food Technology", category: "Engineering", description: "Application of food science to processing and preservation", icon_emoji: "🍽️", keywords: ["food technology","processing","preservation","safety"] },
    { name: "Forensic Science", category: "Science & Nature", description: "Applying scientific methods to criminal investigations", icon_emoji: "🔍", keywords: ["forensics","criminal investigation","DNA analysis","evidence"] },
    { name: "Forestry", category: "Science & Nature", description: "Management and conservation of forests and woodlands", icon_emoji: "🌲", keywords: ["forestry","trees","conservation","timber","wildlife"] },
    { name: "Gastroenterology", category: "Healthcare", description: "Study and treatment of digestive system disorders", icon_emoji: "🫁", keywords: ["gastroenterology","digestive","GI","endoscopy"] },
    { name: "Gender Studies", category: "Social Sciences", description: "Interdisciplinary study of gender and its social implications", icon_emoji: "⚧️", keywords: ["gender studies","feminism","equality","social justice"] },
    { name: "Geoinformatics", category: "Technology", description: "Science and technology of gathering and analyzing geographic data", icon_emoji: "🌐", keywords: ["GIS","geospatial","mapping","remote sensing"] },
    { name: "Gerontology", category: "Healthcare", description: "Study of aging and issues affecting older adults", icon_emoji: "👴", keywords: ["gerontology","aging","elderly","geriatrics"] },
    { name: "Health Informatics", category: "Technology", description: "Information systems and technology for healthcare delivery", icon_emoji: "💻", keywords: ["health informatics","EHR","clinical data","healthcare IT"] },
    { name: "History", category: "Humanities", description: "Study of past events and their impact on civilization", icon_emoji: "📜", keywords: ["history","civilization","events","archives","research"] },
    { name: "Hospitality Management", category: "Hospitality", description: "Managing operations in hotels, restaurants, and tourism", icon_emoji: "🏨", keywords: ["hospitality","hotel management","tourism","food service"] },
    { name: "Human-Computer Interaction", category: "Technology", description: "Study of how people interact with computers and technology", icon_emoji: "🖱️", keywords: ["HCI","interaction design","usability","accessibility"] },
    { name: "Hydrology", category: "Science & Nature", description: "Study of water distribution and movement on Earth", icon_emoji: "💧", keywords: ["hydrology","water","rivers","groundwater","watersheds"] },
    { name: "Immunology", category: "Healthcare", description: "Study of the immune system and immune responses", icon_emoji: "🦠", keywords: ["immunology","immune system","vaccines","antibodies"] },
    { name: "Industrial Engineering", category: "Engineering", description: "Optimizing complex processes and systems", icon_emoji: "🏭", keywords: ["industrial engineering","optimization","manufacturing","operations research"] },
    { name: "Information Systems", category: "Technology", description: "Design and management of information systems in organizations", icon_emoji: "📱", keywords: ["information systems","ERP","databases","business systems"] },
    { name: "International Business", category: "Business", description: "Business operations conducted across national borders", icon_emoji: "🌍", keywords: ["international business","trade","global","exports","imports"] },
    { name: "Islamic Studies", category: "Humanities", description: "Academic study of Islam, its history, and culture", icon_emoji: "☪️", keywords: ["Islamic studies","theology","Arabic","culture"] },
    { name: "Kinesiology", category: "Healthcare", description: "Study of human body movement and mechanics", icon_emoji: "🏃", keywords: ["kinesiology","movement","biomechanics","exercise"] },
    { name: "Landscape Architecture", category: "Design", description: "Design of outdoor spaces, landmarks, and structures", icon_emoji: "🌳", keywords: ["landscape","outdoor design","parks","gardens"] },
    { name: "Logistics Management", category: "Business", description: "Planning and managing the flow of goods and services", icon_emoji: "📦", keywords: ["logistics","transportation","warehousing","distribution"] },
    { name: "Marine Engineering", category: "Engineering", description: "Design and maintenance of ships and maritime structures", icon_emoji: "🚢", keywords: ["marine engineering","ships","naval","offshore"] },
    { name: "Mass Communication", category: "Social Sciences", description: "Study of media and communication to large audiences", icon_emoji: "📡", keywords: ["mass communication","media","broadcasting","journalism"] },
    { name: "Metallurgy", category: "Engineering", description: "Study of metals and their properties and applications", icon_emoji: "⚒️", keywords: ["metallurgy","metals","alloys","smelting"] },
    { name: "Meteorology", category: "Science & Nature", description: "Study of weather and atmospheric phenomena", icon_emoji: "🌤️", keywords: ["meteorology","weather","climate","forecasting"] },
    { name: "Microbiology", category: "Science & Nature", description: "Study of microscopic organisms", icon_emoji: "🦠", keywords: ["microbiology","bacteria","viruses","fungi"] },
    { name: "Mining Engineering", category: "Engineering", description: "Extraction of minerals from the earth", icon_emoji: "⛏️", keywords: ["mining","minerals","extraction","geology"] },
    { name: "Molecular Biology", category: "Science & Nature", description: "Study of biology at the molecular level", icon_emoji: "🧬", keywords: ["molecular biology","DNA","RNA","proteins","genetics"] },
    { name: "Museum Studies", category: "Humanities", description: "Study of museum practices, curation, and exhibition design", icon_emoji: "🏛️", keywords: ["museum","curation","exhibitions","preservation"] },
    { name: "Nephrology", category: "Healthcare", description: "Study and treatment of kidney diseases", icon_emoji: "🫘", keywords: ["nephrology","kidneys","dialysis","renal"] },
    { name: "Nuclear Medicine", category: "Healthcare", description: "Medical imaging using radioactive substances", icon_emoji: "☢️", keywords: ["nuclear medicine","radiology","imaging","PET scan"] },
    { name: "Occupational Therapy", category: "Healthcare", description: "Helping people develop abilities needed for daily living", icon_emoji: "🤲", keywords: ["occupational therapy","rehabilitation","daily living","adaptive"] },
    { name: "Oncology", category: "Healthcare", description: "Study and treatment of cancer", icon_emoji: "🎗️", keywords: ["oncology","cancer","chemotherapy","radiation","tumor"] },
    { name: "Operations Research", category: "Business", description: "Using mathematical models to improve decision-making", icon_emoji: "📐", keywords: ["operations research","optimization","modeling","decision science"] },
    { name: "Ophthalmology", category: "Healthcare", description: "Medical and surgical care of the eye", icon_emoji: "👁️", keywords: ["ophthalmology","eye surgery","vision","retina"] },
    { name: "Organic Chemistry", category: "Science & Nature", description: "Study of carbon-containing compounds", icon_emoji: "⚗️", keywords: ["organic chemistry","carbon","compounds","synthesis"] },
    { name: "Orthopedics", category: "Healthcare", description: "Treatment of musculoskeletal system conditions", icon_emoji: "🦴", keywords: ["orthopedics","bones","joints","surgery","sports medicine"] },
    { name: "Paleontology", category: "Science & Nature", description: "Study of ancient life through fossils", icon_emoji: "🦕", keywords: ["paleontology","fossils","dinosaurs","ancient life"] },
    { name: "Parasitology", category: "Science & Nature", description: "Study of parasites and parasitic diseases", icon_emoji: "🔬", keywords: ["parasitology","parasites","tropical diseases","infectious"] },
    { name: "Pathology", category: "Healthcare", description: "Study of the causes and effects of diseases", icon_emoji: "🔬", keywords: ["pathology","disease","diagnosis","laboratory"] },
    { name: "Pediatrics", category: "Healthcare", description: "Medical care of infants, children, and adolescents", icon_emoji: "👶", keywords: ["pediatrics","children","infant","child health"] },
    { name: "Petroleum Geology", category: "Science & Nature", description: "Study of geological formations containing oil and gas", icon_emoji: "🛢️", keywords: ["petroleum geology","oil","gas","reservoirs"] },
    { name: "Photonics", category: "Engineering", description: "Science and technology of generating and controlling photons", icon_emoji: "💡", keywords: ["photonics","lasers","optics","light","fiber optics"] },
    { name: "Physical Therapy", category: "Healthcare", description: "Treatment of physical disabilities through exercises and massage", icon_emoji: "🏋️", keywords: ["physical therapy","rehabilitation","exercise","movement"] },
    { name: "Plant Science", category: "Science & Nature", description: "Study of plants and their applications", icon_emoji: "🌱", keywords: ["plant science","botany","horticulture","crop science"] },
    { name: "Podiatry", category: "Healthcare", description: "Treatment of foot and ankle conditions", icon_emoji: "🦶", keywords: ["podiatry","feet","ankle","orthotics"] },
    { name: "Polymer Science", category: "Engineering", description: "Study of polymers and plastics", icon_emoji: "🧪", keywords: ["polymers","plastics","materials","synthesis"] },
    { name: "Primatology", category: "Science & Nature", description: "Study of primates", icon_emoji: "🐒", keywords: ["primatology","primates","evolution","behavior"] },
    { name: "Psychiatry", category: "Healthcare", description: "Medical specialty dealing with mental disorders", icon_emoji: "🧠", keywords: ["psychiatry","mental health","medication","diagnosis"] },
    { name: "Public Administration", category: "Government", description: "Management of government organizations and public policy", icon_emoji: "🏛️", keywords: ["public administration","government","policy","bureaucracy"] },
    { name: "Radiology", category: "Healthcare", description: "Medical imaging for diagnosis and treatment", icon_emoji: "🩻", keywords: ["radiology","X-ray","MRI","CT scan","imaging"] },
    { name: "Religious Studies", category: "Humanities", description: "Academic study of religions and spiritual traditions", icon_emoji: "🕊️", keywords: ["religion","theology","spirituality","comparative religion"] },
    { name: "Renewable Materials", category: "Engineering", description: "Development of sustainable and recyclable materials", icon_emoji: "♻️", keywords: ["renewable materials","sustainable","bioplastics","green"] },
    { name: "Rhetoric", category: "Humanities", description: "Art of effective communication and persuasion", icon_emoji: "🗣️", keywords: ["rhetoric","persuasion","communication","speech"] },
    { name: "Seismology", category: "Science & Nature", description: "Study of earthquakes and seismic waves", icon_emoji: "🌋", keywords: ["seismology","earthquakes","tectonic","seismic"] },
    { name: "Semiconductor Engineering", category: "Engineering", description: "Design and fabrication of semiconductor devices", icon_emoji: "🔧", keywords: ["semiconductor","chips","VLSI","fabrication","electronics"] },
    { name: "Sign Language Studies", category: "Education", description: "Study and interpretation of sign languages", icon_emoji: "🤟", keywords: ["sign language","deaf studies","interpretation","ASL"] },
    { name: "Sleep Medicine", category: "Healthcare", description: "Diagnosis and treatment of sleep disorders", icon_emoji: "😴", keywords: ["sleep medicine","insomnia","sleep apnea","polysomnography"] },
    { name: "Social Media Management", category: "Business", description: "Managing brand presence across social media platforms", icon_emoji: "📱", keywords: ["social media","content","engagement","platforms"] },
    { name: "Soil Science", category: "Science & Nature", description: "Study of soil as a natural resource", icon_emoji: "🌍", keywords: ["soil science","pedology","agriculture","land management"] },
    { name: "Sound Engineering", category: "Creative Arts", description: "Technical aspects of sound recording and reproduction", icon_emoji: "🎚️", keywords: ["sound engineering","audio","recording","mixing","mastering"] },
    { name: "Space Science", category: "Science & Nature", description: "Study of everything in outer space", icon_emoji: "🚀", keywords: ["space science","cosmology","astronomy","planetary"] },
    { name: "Speech Pathology", category: "Healthcare", description: "Assessment and treatment of speech and language disorders", icon_emoji: "🗣️", keywords: ["speech pathology","language disorders","therapy","communication"] },
    { name: "Sports Management", category: "Business", description: "Business and management of sports organizations", icon_emoji: "🏟️", keywords: ["sports management","athletics","sports business","events"] },
    { name: "Structural Engineering", category: "Engineering", description: "Design of structures that withstand loads and forces", icon_emoji: "🏗️", keywords: ["structural engineering","buildings","bridges","analysis"] },
    { name: "Supply Chain Analytics", category: "Business", description: "Data-driven optimization of supply chain operations", icon_emoji: "📊", keywords: ["supply chain","analytics","optimization","forecasting"] },
    { name: "Surgical Technology", category: "Healthcare", description: "Assisting in surgical operations and procedures", icon_emoji: "🔪", keywords: ["surgical tech","operating room","instruments","sterile"] },
    { name: "Sustainable Agriculture", category: "Agriculture", description: "Farming practices that protect the environment", icon_emoji: "🌾", keywords: ["sustainable agriculture","organic","permaculture","eco-farming"] },
    { name: "Taxation", category: "Business", description: "Study and practice of tax law and compliance", icon_emoji: "🧾", keywords: ["taxation","tax law","compliance","IRS","VAT"] },
    { name: "Theatre Studies", category: "Creative Arts", description: "Academic and practical study of theatrical arts", icon_emoji: "🎭", keywords: ["theatre","drama","performance","playwriting"] },
    { name: "Theology", category: "Humanities", description: "Study of the nature of the divine and religious beliefs", icon_emoji: "📿", keywords: ["theology","divinity","religion","faith"] },
    { name: "Toxicology", category: "Science & Nature", description: "Study of adverse effects of chemicals on living organisms", icon_emoji: "☠️", keywords: ["toxicology","poisons","chemicals","safety"] },
    { name: "Translation Studies", category: "Humanities", description: "Theory and practice of translating between languages", icon_emoji: "🌐", keywords: ["translation","interpretation","languages","localization"] },
    { name: "Transportation Engineering", category: "Engineering", description: "Design of transportation systems and infrastructure", icon_emoji: "🛣️", keywords: ["transportation","traffic","highways","transit"] },
    { name: "Urology", category: "Healthcare", description: "Treatment of urinary tract and male reproductive conditions", icon_emoji: "🏥", keywords: ["urology","urinary","kidneys","prostate"] },
    { name: "Virology", category: "Science & Nature", description: "Study of viruses and viral diseases", icon_emoji: "🦠", keywords: ["virology","viruses","epidemics","vaccines"] },
    { name: "Viticulture", category: "Agriculture", description: "Cultivation of grapevines for winemaking", icon_emoji: "🍇", keywords: ["viticulture","wine","grapes","vineyards"] },
    { name: "Volcanology", category: "Science & Nature", description: "Study of volcanoes and volcanic phenomena", icon_emoji: "🌋", keywords: ["volcanology","volcanoes","lava","eruption"] },
    { name: "Waste Management", category: "Engineering", description: "Collection, treatment, and disposal of waste materials", icon_emoji: "🗑️", keywords: ["waste management","recycling","disposal","environmental"] },
    { name: "Water Resources Engineering", category: "Engineering", description: "Managing water supply and treatment systems", icon_emoji: "💧", keywords: ["water resources","hydrology","treatment","irrigation"] },
    { name: "Wildlife Management", category: "Science & Nature", description: "Conservation and management of wildlife populations", icon_emoji: "🦁", keywords: ["wildlife","conservation","ecology","habitat"] },
    { name: "Women's Studies", category: "Social Sciences", description: "Study of women's experiences, rights, and contributions", icon_emoji: "♀️", keywords: ["women's studies","feminism","gender","equality"] },
    { name: "Zoology", category: "Science & Nature", description: "Study of animals and animal life", icon_emoji: "🦁", keywords: ["zoology","animals","biology","wildlife","ecology"] },
  ];
}

function getExhaustiveJobRoles() {
  return [
    { title: "Actuary", domain: "Finance", description: "Assesses financial risk using mathematics and statistics", skills_required: ["statistics","risk modeling","Excel"], keywords: ["actuary","risk","insurance"], career_path_keywords: ["Accounting & Finance"] },
    { title: "Agricultural Engineer", domain: "Engineering", description: "Designs agricultural equipment and systems", skills_required: ["mechanical design","irrigation","soil science"], keywords: ["agricultural","engineering","farming"], career_path_keywords: ["Agriculture"] },
    { title: "Air Traffic Controller", domain: "Aviation", description: "Manages air traffic for safe and efficient flight operations", skills_required: ["communication","spatial awareness","decision making"], keywords: ["ATC","aviation","flight control"], career_path_keywords: ["Aerospace Engineering"] },
    { title: "Anesthesiologist", domain: "Healthcare", description: "Administers anesthesia during surgical procedures", skills_required: ["pharmacology","patient monitoring","critical care"], keywords: ["anesthesia","surgery","medical"], career_path_keywords: ["Medicine"] },
    { title: "Anthropologist", domain: "Social Sciences", description: "Studies human societies, cultures, and evolution", skills_required: ["research","fieldwork","cultural analysis"], keywords: ["anthropology","culture","research"], career_path_keywords: ["Social Sciences"] },
    { title: "App Developer", domain: "Technology", description: "Creates mobile and web applications", skills_required: ["Swift","Kotlin","React Native","Flutter"], keywords: ["mobile","apps","development"], career_path_keywords: ["Software Engineering"] },
    { title: "Archaeologist", domain: "Humanities", description: "Studies human history through excavation and artifacts", skills_required: ["excavation","dating methods","documentation"], keywords: ["archaeology","history","excavation"], career_path_keywords: ["History"] },
    { title: "Art Director", domain: "Creative Arts", description: "Oversees visual aspects of creative projects", skills_required: ["creative direction","design","typography","branding"], keywords: ["art direction","creative","visual"], career_path_keywords: ["Graphic Design"] },
    { title: "Audiologist", domain: "Healthcare", description: "Diagnoses and treats hearing disorders", skills_required: ["audiometry","hearing aids","patient care"], keywords: ["audiology","hearing","balance"], career_path_keywords: ["Healthcare"] },
    { title: "Biostatistician", domain: "Science", description: "Applies statistics to biological and health research", skills_required: ["statistics","R","SAS","clinical trials"], keywords: ["biostatistics","research","clinical"], career_path_keywords: ["Biotechnology","Public Health"] },
    { title: "Budget Analyst", domain: "Finance", description: "Reviews and analyzes budget proposals", skills_required: ["budgeting","Excel","financial analysis"], keywords: ["budget","finance","analysis"], career_path_keywords: ["Accounting & Finance"] },
    { title: "Building Inspector", domain: "Engineering", description: "Inspects buildings for code compliance and safety", skills_required: ["building codes","inspection","documentation"], keywords: ["building","inspection","safety"], career_path_keywords: ["Civil Engineering"] },
    { title: "Cardiologist", domain: "Healthcare", description: "Diagnoses and treats heart conditions", skills_required: ["cardiology","ECG","catheterization"], keywords: ["cardiology","heart","cardiovascular"], career_path_keywords: ["Medicine"] },
    { title: "Cartographer", domain: "Science", description: "Creates maps and geographic visualizations", skills_required: ["GIS","remote sensing","cartography"], keywords: ["maps","GIS","geography"], career_path_keywords: ["Geography"] },
    { title: "Chief Technology Officer", domain: "Technology", description: "Leads technology strategy and engineering teams", skills_required: ["technology strategy","leadership","architecture"], keywords: ["CTO","technology","leadership"], career_path_keywords: ["Software Engineering"] },
    { title: "Chiropractor", domain: "Healthcare", description: "Treats musculoskeletal disorders through spinal manipulation", skills_required: ["spinal adjustment","anatomy","patient care"], keywords: ["chiropractic","spine","musculoskeletal"], career_path_keywords: ["Healthcare"] },
    { title: "Clinical Research Coordinator", domain: "Healthcare", description: "Manages clinical trials and research studies", skills_required: ["clinical trials","regulatory compliance","data management"], keywords: ["clinical research","trials","coordinator"], career_path_keywords: ["Biotechnology","Medicine"] },
    { title: "Compliance Officer", domain: "Business", description: "Ensures organizational compliance with laws and regulations", skills_required: ["regulatory knowledge","auditing","risk assessment"], keywords: ["compliance","regulations","risk"], career_path_keywords: ["Law","Business"] },
    { title: "Conservation Scientist", domain: "Science", description: "Manages natural resources and protects ecosystems", skills_required: ["ecology","field research","GIS","conservation planning"], keywords: ["conservation","ecology","natural resources"], career_path_keywords: ["Environmental Science"] },
    { title: "Construction Manager", domain: "Engineering", description: "Oversees construction projects from planning to completion", skills_required: ["project management","budgeting","scheduling","safety"], keywords: ["construction","management","building"], career_path_keywords: ["Civil Engineering"] },
    { title: "Copywriter", domain: "Creative Arts", description: "Writes persuasive copy for marketing and advertising", skills_required: ["writing","creativity","SEO","brand voice"], keywords: ["copywriting","advertising","content"], career_path_keywords: ["Marketing & Advertising"] },
    { title: "Coroner", domain: "Law", description: "Investigates causes of death", skills_required: ["forensic pathology","anatomy","investigation"], keywords: ["coroner","forensics","investigation"], career_path_keywords: ["Medicine","Law"] },
    { title: "Curator", domain: "Humanities", description: "Manages collections in museums and galleries", skills_required: ["art history","preservation","exhibition design"], keywords: ["curator","museum","gallery","art"], career_path_keywords: ["Art History"] },
    { title: "Database Administrator", domain: "Technology", description: "Manages and maintains database systems", skills_required: ["SQL","database design","performance tuning","backup"], keywords: ["DBA","database","SQL"], career_path_keywords: ["Software Engineering"] },
    { title: "Dental Hygienist", domain: "Healthcare", description: "Provides preventive dental care and cleanings", skills_required: ["dental cleaning","X-rays","patient education"], keywords: ["dental hygienist","oral care","preventive"], career_path_keywords: ["Dentistry"] },
    { title: "Dermatologist", domain: "Healthcare", description: "Diagnoses and treats skin conditions", skills_required: ["dermatology","biopsy","cosmetic procedures"], keywords: ["dermatology","skin","cosmetic"], career_path_keywords: ["Medicine"] },
    { title: "Dietitian", domain: "Healthcare", description: "Plans nutrition programs and counsels patients on diet", skills_required: ["nutrition","meal planning","counseling"], keywords: ["dietitian","nutrition","food"], career_path_keywords: ["Nutrition"] },
    { title: "Drone Operator", domain: "Technology", description: "Operates unmanned aerial vehicles for various applications", skills_required: ["drone piloting","aerial photography","regulations"], keywords: ["drone","UAV","aerial","remote"], career_path_keywords: ["Robotics & Automation"] },
    { title: "Ecologist", domain: "Science", description: "Studies relationships between organisms and their environments", skills_required: ["field research","data analysis","ecology","GIS"], keywords: ["ecology","ecosystems","biodiversity"], career_path_keywords: ["Environmental Science"] },
    { title: "Editor", domain: "Media", description: "Reviews and edits written or visual content", skills_required: ["editing","proofreading","content management"], keywords: ["editor","publishing","content"], career_path_keywords: ["Writing & Publishing"] },
    { title: "Electrician", domain: "Trades", description: "Installs and repairs electrical systems", skills_required: ["wiring","electrical codes","troubleshooting"], keywords: ["electrician","wiring","electrical"], career_path_keywords: ["Electrical Engineering"] },
    { title: "Emergency Medical Technician", domain: "Healthcare", description: "Provides emergency medical care and patient transport", skills_required: ["first aid","CPR","patient assessment","triage"], keywords: ["EMT","emergency","paramedic"], career_path_keywords: ["Emergency Medicine"] },
    { title: "Endocrinologist", domain: "Healthcare", description: "Treats hormonal and metabolic disorders", skills_required: ["endocrinology","diabetes management","thyroid"], keywords: ["endocrinology","hormones","diabetes"], career_path_keywords: ["Medicine"] },
    { title: "Epidemiologist", domain: "Healthcare", description: "Studies patterns and causes of diseases in populations", skills_required: ["biostatistics","research design","data analysis"], keywords: ["epidemiology","disease","public health"], career_path_keywords: ["Public Health"] },
    { title: "Ergonomist", domain: "Engineering", description: "Designs workplaces and products for human use", skills_required: ["human factors","ergonomics","workplace design"], keywords: ["ergonomics","human factors","workplace"], career_path_keywords: ["Industrial Design"] },
    { title: "Fashion Merchandiser", domain: "Business", description: "Plans and manages fashion retail strategies", skills_required: ["merchandising","trend analysis","retail management"], keywords: ["fashion","merchandising","retail"], career_path_keywords: ["Fashion Design"] },
    { title: "Film Editor", domain: "Creative Arts", description: "Assembles and edits film footage into finished productions", skills_required: ["Premiere Pro","DaVinci Resolve","storytelling","pacing"], keywords: ["film editing","post-production","cinema"], career_path_keywords: ["Film & Entertainment"] },
    { title: "Financial Planner", domain: "Finance", description: "Advises clients on financial planning and investments", skills_required: ["financial planning","investment management","tax planning"], keywords: ["financial planning","wealth","investments"], career_path_keywords: ["Accounting & Finance"] },
    { title: "Fire Engineer", domain: "Engineering", description: "Designs fire protection systems for buildings", skills_required: ["fire safety","building codes","sprinkler systems"], keywords: ["fire engineering","safety","protection"], career_path_keywords: ["Civil Engineering"] },
    { title: "Flight Attendant", domain: "Hospitality", description: "Ensures passenger safety and comfort during flights", skills_required: ["customer service","safety procedures","first aid"], keywords: ["flight attendant","aviation","service"], career_path_keywords: ["Hospitality & Tourism"] },
    { title: "Food Scientist", domain: "Science", description: "Researches food production, safety, and nutrition", skills_required: ["food chemistry","microbiology","quality control"], keywords: ["food science","nutrition","safety"], career_path_keywords: ["Food Technology"] },
    { title: "Forensic Accountant", domain: "Finance", description: "Investigates financial fraud and irregularities", skills_required: ["accounting","investigation","fraud detection"], keywords: ["forensic accounting","fraud","investigation"], career_path_keywords: ["Accounting & Finance","Law"] },
    { title: "Gastroenterologist", domain: "Healthcare", description: "Diagnoses and treats digestive system disorders", skills_required: ["endoscopy","GI diagnosis","patient care"], keywords: ["gastroenterology","digestive","GI"], career_path_keywords: ["Medicine"] },
    { title: "Genetic Counselor", domain: "Healthcare", description: "Advises on genetic risks and testing", skills_required: ["genetics","counseling","risk assessment"], keywords: ["genetic counseling","DNA","hereditary"], career_path_keywords: ["Genetics"] },
    { title: "GIS Specialist", domain: "Technology", description: "Creates and analyzes geographic information systems", skills_required: ["GIS","mapping","spatial analysis","remote sensing"], keywords: ["GIS","mapping","geospatial"], career_path_keywords: ["Geography"] },
    { title: "Growth Hacker", domain: "Business", description: "Uses creative strategies to rapidly grow user bases", skills_required: ["analytics","A/B testing","marketing automation"], keywords: ["growth","hacking","startup","marketing"], career_path_keywords: ["Marketing & Advertising","Entrepreneurship"] },
    { title: "Hematologist", domain: "Healthcare", description: "Treats blood disorders and diseases", skills_required: ["hematology","blood analysis","oncology"], keywords: ["hematology","blood","disorders"], career_path_keywords: ["Medicine"] },
    { title: "Hydrologist", domain: "Science", description: "Studies the distribution and movement of water", skills_required: ["hydrology","modeling","field measurement","GIS"], keywords: ["hydrology","water","rivers","groundwater"], career_path_keywords: ["Environmental Science"] },
    { title: "Immigration Lawyer", domain: "Law", description: "Handles immigration cases and visa applications", skills_required: ["immigration law","documentation","case management"], keywords: ["immigration","visa","legal"], career_path_keywords: ["Law"] },
    { title: "Industrial Engineer", domain: "Engineering", description: "Optimizes manufacturing and production processes", skills_required: ["lean manufacturing","Six Sigma","operations research"], keywords: ["industrial engineering","optimization","manufacturing"], career_path_keywords: ["Mechanical Engineering"] },
    { title: "Insurance Underwriter", domain: "Finance", description: "Evaluates and decides on insurance applications", skills_required: ["risk assessment","analysis","insurance policies"], keywords: ["underwriting","insurance","risk"], career_path_keywords: ["Accounting & Finance"] },
    { title: "Intelligence Analyst", domain: "Government", description: "Analyzes data to support national security decisions", skills_required: ["data analysis","research","critical thinking","security clearance"], keywords: ["intelligence","analysis","security"], career_path_keywords: ["Cybersecurity","Government"] },
    { title: "Interpreter", domain: "Languages", description: "Translates spoken or sign language in real time", skills_required: ["bilingual fluency","cultural knowledge","memory"], keywords: ["interpreter","translation","language"], career_path_keywords: ["Languages"] },
    { title: "Investment Analyst", domain: "Finance", description: "Researches and recommends investment opportunities", skills_required: ["financial modeling","research","valuation"], keywords: ["investment","analysis","stocks"], career_path_keywords: ["Investment Banking"] },
  ];
}

function getExhaustiveCareerPaths() {
  return [
    { title: "Actuarial Science", domain: "Business", description: "Applying mathematical and statistical methods to assess risk in insurance and finance", salary_range: "$70K-$150K", demand_level: "High", difficulty: "Hard", growth_trajectory: "Stable with strong earning potential", icon_emoji: "📐", keywords: ["actuarial","risk","insurance","math"], related_skills: ["Statistics","Probability","Excel","Programming","Risk Analysis"] },
    { title: "Agricultural Science", domain: "Agriculture", description: "Researching and developing methods to improve crop yields and farming practices", salary_range: "$45K-$90K", demand_level: "Medium", difficulty: "Medium", growth_trajectory: "Growing with food security focus", icon_emoji: "🌾", keywords: ["agriculture","farming","crops","food"], related_skills: ["Agronomy","Soil Science","Biotechnology","Research"] },
    { title: "Animation & VFX", domain: "Creative Arts", description: "Creating animated content and visual effects for entertainment", salary_range: "$45K-$120K", demand_level: "High", difficulty: "Medium-Hard", growth_trajectory: "Growing with streaming demand", icon_emoji: "🎬", keywords: ["animation","VFX","3D","motion graphics"], related_skills: ["Maya","Blender","After Effects","Character Animation"] },
    { title: "Audiology", domain: "Healthcare", description: "Diagnosing and treating hearing and balance disorders", salary_range: "$70K-$100K", demand_level: "Medium", difficulty: "Hard", growth_trajectory: "Stable with aging population growth", icon_emoji: "👂", keywords: ["audiology","hearing","balance","clinical"], related_skills: ["Audiometry","Hearing Aids","Patient Care","Diagnostics"] },
    { title: "Automotive Engineering", domain: "Engineering", description: "Designing and developing motor vehicles and EV technology", salary_range: "$65K-$130K", demand_level: "High", difficulty: "Hard", growth_trajectory: "Booming with EV revolution", icon_emoji: "🚗", keywords: ["automotive","cars","EV","electric vehicles"], related_skills: ["CAD","Vehicle Dynamics","EV Systems","Manufacturing"] },
    { title: "Bioinformatics", domain: "Technology", description: "Using computational tools to analyze biological data", salary_range: "$65K-$130K", demand_level: "High", difficulty: "Hard", growth_trajectory: "Rapidly growing with genomics boom", icon_emoji: "🧬", keywords: ["bioinformatics","genomics","computational biology"], related_skills: ["Python","R","Genomics","Statistics","Databases"] },
    { title: "Chemical Engineering", domain: "Engineering", description: "Designing processes for chemical manufacturing and pharmaceuticals", salary_range: "$70K-$130K", demand_level: "Medium-High", difficulty: "Hard", growth_trajectory: "Stable across industries", icon_emoji: "⚗️", keywords: ["chemical","process","pharmaceutical","manufacturing"], related_skills: ["Process Design","Thermodynamics","Safety","HAZOP"] },
    { title: "Chiropractic", domain: "Healthcare", description: "Treating musculoskeletal disorders through manual therapy", salary_range: "$60K-$120K", demand_level: "Medium", difficulty: "Hard", growth_trajectory: "Stable with wellness trend", icon_emoji: "🦴", keywords: ["chiropractic","spine","wellness","manual therapy"], related_skills: ["Anatomy","Manual Therapy","Patient Assessment","Rehabilitation"] },
    { title: "Clinical Research", domain: "Healthcare", description: "Conducting and managing clinical trials for new treatments", salary_range: "$55K-$120K", demand_level: "Very High", difficulty: "Hard", growth_trajectory: "Booming with pharmaceutical growth", icon_emoji: "🔬", keywords: ["clinical research","trials","pharmaceutical","FDA"], related_skills: ["Clinical Trials","Regulatory Affairs","Data Management","GCP"] },
    { title: "Cognitive Science", domain: "Science", description: "Interdisciplinary study of the mind, brain, and intelligence", salary_range: "$55K-$110K", demand_level: "Medium", difficulty: "Hard", growth_trajectory: "Growing with AI and UX demand", icon_emoji: "🧩", keywords: ["cognitive science","mind","brain","intelligence"], related_skills: ["Psychology","Neuroscience","Programming","Research","Statistics"] },
    { title: "Communications & PR", domain: "Business", description: "Managing organizational communications and public perception", salary_range: "$45K-$110K", demand_level: "High", difficulty: "Medium", growth_trajectory: "Digital-first transformation", icon_emoji: "📢", keywords: ["communications","PR","media","corporate"], related_skills: ["Writing","Media Relations","Crisis Management","Social Media"] },
    { title: "Content Strategy", domain: "Business", description: "Planning and creating content that drives business goals", salary_range: "$50K-$120K", demand_level: "Very High", difficulty: "Medium", growth_trajectory: "Essential in digital economy", icon_emoji: "✍️", keywords: ["content strategy","content marketing","editorial","SEO"], related_skills: ["Writing","SEO","Analytics","CMS","Content Planning"] },
    { title: "Criminal Justice", domain: "Law", description: "Working within the criminal justice system in law enforcement or corrections", salary_range: "$40K-$90K", demand_level: "High", difficulty: "Medium", growth_trajectory: "Stable public sector career", icon_emoji: "🚔", keywords: ["criminal justice","law enforcement","corrections","criminology"], related_skills: ["Investigation","Report Writing","Crisis Management","Law"] },
    { title: "Dermatology", domain: "Healthcare", description: "Diagnosing and treating skin, hair, and nail conditions", salary_range: "$200K-$400K", demand_level: "High", difficulty: "Very Hard", growth_trajectory: "High demand specialty", icon_emoji: "🧴", keywords: ["dermatology","skin","cosmetic","medical"], related_skills: ["Dermatoscopy","Biopsy","Cosmetic Procedures","Patient Care"] },
    { title: "E-Commerce", domain: "Business", description: "Building and managing online retail businesses", salary_range: "$45K-$150K+", demand_level: "Very High", difficulty: "Medium", growth_trajectory: "Explosive growth continuing", icon_emoji: "🛒", keywords: ["ecommerce","online retail","Shopify","Amazon"], related_skills: ["Digital Marketing","Analytics","Supply Chain","UX","Payments"] },
    { title: "Emergency Medicine", domain: "Healthcare", description: "Providing immediate medical care for acute conditions", salary_range: "$200K-$350K", demand_level: "Very High", difficulty: "Very Hard", growth_trajectory: "Always in demand", icon_emoji: "🚑", keywords: ["emergency","ER","acute care","trauma"], related_skills: ["Triage","Critical Care","Procedures","Decision Making"] },
    { title: "Epidemiology", domain: "Healthcare", description: "Studying disease patterns to protect public health", salary_range: "$60K-$120K", demand_level: "High", difficulty: "Hard", growth_trajectory: "Critical post-pandemic growth", icon_emoji: "📊", keywords: ["epidemiology","disease","outbreak","surveillance"], related_skills: ["Biostatistics","Research Design","Data Analysis","SAS"] },
    { title: "Forensic Science", domain: "Science", description: "Applying scientific techniques to criminal investigations", salary_range: "$50K-$90K", demand_level: "Medium", difficulty: "Hard", growth_trajectory: "Growing with DNA technology advances", icon_emoji: "🔍", keywords: ["forensics","crime scene","DNA","investigation"], related_skills: ["Lab Techniques","DNA Analysis","Evidence Collection","Documentation"] },
    { title: "Genetic Counseling", domain: "Healthcare", description: "Advising patients and families on genetic risks and testing", salary_range: "$70K-$100K", demand_level: "High", difficulty: "Hard", growth_trajectory: "Rapidly growing with genomics", icon_emoji: "🧬", keywords: ["genetic counseling","DNA","hereditary","genomics"], related_skills: ["Genetics","Counseling","Risk Assessment","Communication"] },
    { title: "Health Informatics", domain: "Technology", description: "Managing health data systems and clinical technology", salary_range: "$65K-$120K", demand_level: "Very High", difficulty: "Medium", growth_trajectory: "Booming with digital health transformation", icon_emoji: "💻", keywords: ["health informatics","EHR","clinical data","healthcare IT"], related_skills: ["EHR Systems","Data Analysis","SQL","HL7","Clinical Workflows"] },
    { title: "Human-Computer Interaction", domain: "Technology", description: "Studying and designing how people interact with technology", salary_range: "$70K-$150K", demand_level: "Very High", difficulty: "Medium-Hard", growth_trajectory: "Central to product design evolution", icon_emoji: "🖱️", keywords: ["HCI","interaction design","usability","UX research"], related_skills: ["User Research","Prototyping","Statistics","Psychology","Design"] },
    { title: "Industrial Design", domain: "Design", description: "Designing consumer products for mass production", salary_range: "$50K-$110K", demand_level: "Medium", difficulty: "Medium", growth_trajectory: "Growing with sustainable product focus", icon_emoji: "🔧", keywords: ["industrial design","product design","manufacturing","consumer"], related_skills: ["CAD","SolidWorks","Prototyping","User Research","Manufacturing"] },
    { title: "Interior Design", domain: "Design", description: "Designing functional and aesthetic interior spaces", salary_range: "$40K-$90K", demand_level: "Medium", difficulty: "Medium", growth_trajectory: "Steady with real estate market", icon_emoji: "🏠", keywords: ["interior design","spaces","decoration","commercial"], related_skills: ["AutoCAD","SketchUp","Space Planning","Materials","Rendering"] },
    { title: "Library & Information Science", domain: "Education", description: "Organizing and managing information resources and systems", salary_range: "$40K-$70K", demand_level: "Low-Medium", difficulty: "Medium", growth_trajectory: "Evolving with digital information", icon_emoji: "📖", keywords: ["library","information science","archiving","digital"], related_skills: ["Cataloging","Database Management","Digital Libraries","Research"] },
    { title: "Marine Biology", domain: "Science", description: "Studying marine organisms and ocean ecosystems", salary_range: "$45K-$80K", demand_level: "Medium", difficulty: "Hard", growth_trajectory: "Growing with ocean conservation focus", icon_emoji: "🐠", keywords: ["marine biology","ocean","ecology","conservation"], related_skills: ["Scuba Diving","Field Research","Data Analysis","Lab Techniques"] },
    { title: "Materials Science", domain: "Engineering", description: "Studying and developing new materials with specific properties", salary_range: "$60K-$120K", demand_level: "High", difficulty: "Hard", growth_trajectory: "Growing with nanotechnology and composites", icon_emoji: "🔩", keywords: ["materials science","metals","polymers","ceramics","nano"], related_skills: ["Materials Testing","Spectroscopy","Metallurgy","Simulation"] },
    { title: "Nuclear Engineering", domain: "Engineering", description: "Applying nuclear processes for energy production and research", salary_range: "$75K-$140K", demand_level: "Medium", difficulty: "Very Hard", growth_trajectory: "Reviving with clean energy interest", icon_emoji: "☢️", keywords: ["nuclear","reactor","radiation","energy","fusion"], related_skills: ["Nuclear Physics","Radiation Safety","Reactor Design","Simulation"] },
    { title: "Nutrition & Dietetics", domain: "Healthcare", description: "Advising on diet and nutrition for health and performance", salary_range: "$40K-$80K", demand_level: "High", difficulty: "Medium", growth_trajectory: "Growing with health consciousness", icon_emoji: "🥗", keywords: ["nutrition","dietetics","food","wellness","health"], related_skills: ["Nutrition Planning","Diet Assessment","Counseling","Food Science"] },
    { title: "Occupational Therapy", domain: "Healthcare", description: "Helping people develop daily living and work skills after injury", salary_range: "$60K-$95K", demand_level: "High", difficulty: "Hard", growth_trajectory: "Growing with aging population", icon_emoji: "🤲", keywords: ["occupational therapy","rehabilitation","daily living","adaptive"], related_skills: ["Assessment","Rehabilitation","Adaptive Techniques","Patient Care"] },
    { title: "Optometry", domain: "Healthcare", description: "Examining eyes and prescribing corrective treatments", salary_range: "$90K-$150K", demand_level: "Medium", difficulty: "Hard", growth_trajectory: "Stable with technology advances", icon_emoji: "👓", keywords: ["optometry","eyes","vision","optical"], related_skills: ["Eye Examination","Optics","Patient Care","Diagnostics"] },
    { title: "Petroleum Engineering", domain: "Engineering", description: "Extracting oil and gas from underground reservoirs", salary_range: "$80K-$170K", demand_level: "Medium", difficulty: "Hard", growth_trajectory: "Cyclical but well-compensated", icon_emoji: "🛢️", keywords: ["petroleum","oil","gas","drilling","reservoir"], related_skills: ["Reservoir Engineering","Drilling","Geology","Simulation"] },
    { title: "Physical Therapy", domain: "Healthcare", description: "Treating physical disabilities through therapeutic exercises", salary_range: "$60K-$95K", demand_level: "Very High", difficulty: "Hard", growth_trajectory: "Strong growth with sports and aging", icon_emoji: "🏋️", keywords: ["physical therapy","rehabilitation","exercise","movement"], related_skills: ["Therapeutic Exercise","Manual Therapy","Patient Assessment","Anatomy"] },
    { title: "Podiatry", domain: "Healthcare", description: "Treating foot and ankle conditions and disorders", salary_range: "$80K-$150K", demand_level: "Medium", difficulty: "Hard", growth_trajectory: "Stable niche specialty", icon_emoji: "🦶", keywords: ["podiatry","feet","ankle","orthotics"], related_skills: ["Podiatric Medicine","Surgery","Biomechanics","Orthotics"] },
    { title: "Political Science", domain: "Social Sciences", description: "Studying political systems, governance, and public policy", salary_range: "$45K-$100K", demand_level: "Medium", difficulty: "Medium", growth_trajectory: "Stable with government and NGO demand", icon_emoji: "🏛️", keywords: ["political science","government","policy","politics"], related_skills: ["Research","Policy Analysis","Writing","Data Analysis","Advocacy"] },
    { title: "Psychiatry", domain: "Healthcare", description: "Diagnosing and treating mental disorders with medication and therapy", salary_range: "$200K-$350K", demand_level: "Very High", difficulty: "Very Hard", growth_trajectory: "Critical shortage creating high demand", icon_emoji: "🧠", keywords: ["psychiatry","mental health","medication","therapy"], related_skills: ["Psychopharmacology","Diagnosis","Therapy","Patient Care"] },
    { title: "Radiology", domain: "Healthcare", description: "Using medical imaging to diagnose and treat diseases", salary_range: "$250K-$450K", demand_level: "High", difficulty: "Very Hard", growth_trajectory: "Growing with AI-assisted imaging", icon_emoji: "🩻", keywords: ["radiology","imaging","MRI","CT","X-ray"], related_skills: ["Medical Imaging","Interpretation","Procedures","Technology"] },
    { title: "Sociology", domain: "Social Sciences", description: "Studying society, social behavior, and institutions", salary_range: "$40K-$85K", demand_level: "Medium", difficulty: "Medium", growth_trajectory: "Growing in policy and research", icon_emoji: "👥", keywords: ["sociology","society","culture","research","social"], related_skills: ["Research Methods","Statistics","Writing","Data Analysis"] },
    { title: "Sound Engineering", domain: "Creative Arts", description: "Recording, mixing, and producing audio for media and music", salary_range: "$35K-$90K", demand_level: "Medium", difficulty: "Medium", growth_trajectory: "Growing with content creation boom", icon_emoji: "🎚️", keywords: ["sound engineering","audio","recording","mixing"], related_skills: ["DAW","Mixing","Mastering","Acoustics","Live Sound"] },
    { title: "Speech-Language Pathology", domain: "Healthcare", description: "Assessing and treating speech and language disorders", salary_range: "$60K-$95K", demand_level: "High", difficulty: "Hard", growth_trajectory: "Growing with awareness and early intervention", icon_emoji: "🗣️", keywords: ["speech pathology","language","communication","therapy"], related_skills: ["Assessment","Therapy Techniques","Augmentative Communication"] },
    { title: "Structural Engineering", domain: "Engineering", description: "Designing structures to withstand loads and environmental forces", salary_range: "$65K-$120K", demand_level: "High", difficulty: "Hard", growth_trajectory: "Essential for infrastructure development", icon_emoji: "🏗️", keywords: ["structural","buildings","bridges","analysis","design"], related_skills: ["Structural Analysis","FEA","Building Codes","CAD","Concrete Design"] },
    { title: "Telecommunications", domain: "Technology", description: "Designing and managing communication networks and systems", salary_range: "$60K-$130K", demand_level: "High", difficulty: "Hard", growth_trajectory: "Growing with 5G and IoT expansion", icon_emoji: "📡", keywords: ["telecom","5G","wireless","networks","fiber"], related_skills: ["Network Design","RF Engineering","5G","Fiber Optics"] },
    { title: "Translation & Interpretation", domain: "Languages", description: "Converting text or speech between languages professionally", salary_range: "$35K-$80K", demand_level: "Medium", difficulty: "Medium", growth_trajectory: "Evolving with AI but human expertise remains valued", icon_emoji: "🌐", keywords: ["translation","interpretation","languages","localization"], related_skills: ["Bilingual Fluency","Cultural Knowledge","Specialized Terminology"] },
    { title: "Waste Management", domain: "Engineering", description: "Managing waste collection, treatment, and sustainable disposal", salary_range: "$50K-$100K", demand_level: "High", difficulty: "Medium", growth_trajectory: "Growing with sustainability mandates", icon_emoji: "♻️", keywords: ["waste management","recycling","environmental","sustainability"], related_skills: ["Environmental Regulations","Operations","Sustainability","Engineering"] },
    { title: "Wildlife Conservation", domain: "Science", description: "Protecting and managing wildlife populations and habitats", salary_range: "$35K-$70K", demand_level: "Medium", difficulty: "Medium-Hard", growth_trajectory: "Growing with biodiversity crisis awareness", icon_emoji: "🦁", keywords: ["wildlife","conservation","ecology","habitat","biodiversity"], related_skills: ["Field Research","GIS","Data Analysis","Conservation Planning"] },
  ];
}
