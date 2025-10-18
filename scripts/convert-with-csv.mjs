import shapefile from 'shapefile';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CSVファイルを読み込んで人口データを取得
async function loadPopulationData(csvPath) {
  const content = await fs.readFile(csvPath, 'utf-8');
  const lines = content.split('\n');

  const populationMap = new Map();

  // ヘッダー行をスキップして処理
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.split(',');
    const keyCode = columns[0];
    const population = columns[4]; // T001102001 = 人口総数（5列目）

    // *や空の値はスキップ
    if (population && population !== '*' && population !== '') {
      const popNum = parseInt(population, 10);
      if (!isNaN(popNum) && popNum > 0) {
        populationMap.set(keyCode, popNum);
      }
    }
  }

  return populationMap;
}

// 人口に応じた色分け（ヒートマップ風）
function getColorByPopulation(population) {
  if (population >= 1000) return '#d73027'; // 濃い赤
  if (population >= 500) return '#fc8d59';  // オレンジ
  if (population >= 200) return '#fee08b';  // 黄色
  if (population >= 100) return '#d9ef8b';  // 黄緑
  if (population >= 50) return '#91cf60';   // 緑
  if (population >= 20) return '#1a9850';   // 濃い緑
  return '#4575b4'; // 青（少人口）
}

async function convertShapefileWithPopulation(shpPath, populationMap) {
  console.log(`Converting ${shpPath}...`);

  const features = [];
  let processed = 0;
  let withPopulation = 0;

  try {
    const source = await shapefile.open(shpPath);
    let result = await source.read();

    while (!result.done) {
      const feature = result.value;
      processed++;

      const meshCode = feature.properties.KEY_CODE;
      const population = populationMap.get(meshCode);

      // 人口データがある場合のみ追加
      if (population && population > 0) {
        withPopulation++;

        const color = getColorByPopulation(population);

        features.push({
          type: 'Feature',
          geometry: feature.geometry,
          properties: {
            meshCode: meshCode,
            population: population,
            color: color,
            fillOpacity: 0.6
          }
        });
      }

      result = await source.read();
    }

    console.log(`  Processed: ${processed}, With population: ${withPopulation}`);
  } catch (error) {
    console.error(`Error processing ${shpPath}:`, error);
  }

  return features;
}

async function main() {
  const baseDir = path.join(__dirname, '../temp_shapefile');
  const outputDir = path.join(__dirname, '../public/data');

  // 出力ディレクトリを作成
  await fs.mkdir(outputDir, { recursive: true });

  const allFeatures = [];

  // 富山市のメッシュコード範囲
  const meshData = [
    { prefix: '5436', csv: 'tblT001102Q5436.txt', folder: 'QDDSWQ5436', shp: 'MESH05436.shp' },
    { prefix: '5437', csv: 'tblT001102Q5437.txt', folder: 'QDDSWQ5437', shp: 'MESH05437.shp' },
    { prefix: '5536', csv: 'tblT001102Q5536.txt', folder: 'QDDSWQ5536', shp: 'MESH05536.shp' },
    { prefix: '5537', csv: 'tblT001102Q5537.txt', folder: 'QDDSWQ5537', shp: 'MESH05537.shp' }
  ];

  for (const mesh of meshData) {
    console.log(`\nProcessing ${mesh.prefix}...`);

    // CSVから人口データを読み込み
    const csvPath = path.join(baseDir, mesh.csv);
    const populationMap = await loadPopulationData(csvPath);
    console.log(`  Loaded ${populationMap.size} population records from CSV`);

    // Shapefileを変換
    const shpPath = path.join(baseDir, mesh.folder, mesh.shp);
    const features = await convertShapefileWithPopulation(shpPath, populationMap);
    allFeatures.push(...features);
  }

  // GeoJSON FeatureCollectionを作成
  const geojson = {
    type: 'FeatureCollection',
    features: allFeatures
  };

  // ファイルに保存
  const outputPath = path.join(outputDir, 'population-mesh.json');
  await fs.writeFile(outputPath, JSON.stringify(geojson));

  const stats = await fs.stat(outputPath);

  console.log(`\n✓ Conversion complete!`);
  console.log(`  Total features: ${allFeatures.length}`);
  console.log(`  Output: ${outputPath}`);
  console.log(`  File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(console.error);
