const canvas = document.getElementById("gameCanvas");
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;

      const ui = {
        waveValue: document.getElementById("waveValue"),
        mapValue: document.getElementById("mapValue"),
        trophyValue: document.getElementById("trophyValue"),
        levelValue: document.getElementById("levelValue"),
        weatherValue: document.getElementById("weatherValue"),
        sceneTag: document.getElementById("sceneTag"),
        statusText: document.getElementById("statusText"),
        weaponText: document.getElementById("weaponText"),
        phaseDesc: document.getElementById("phaseDesc"),
        plantList: document.getElementById("plantList"),
        coinsValue: document.getElementById("coinsValue"),
        materialValue: document.getElementById("materialValue"),
        seedMageValue: document.getElementById("seedMageValue"),
        seedSlowValue: document.getElementById("seedSlowValue"),
        seedHealValue: document.getElementById("seedHealValue"),
        seedBuffValue: document.getElementById("seedBuffValue"),
        coreValue: document.getElementById("coreValue"),
        lifeValue: document.getElementById("lifeValue"),
        explorePanel: document.getElementById("explorePanel"),
        upgradePanel: document.getElementById("upgradePanel"),
        startDefense: document.getElementById("startDefense"),
        toUpgrade: document.getElementById("toUpgrade"),
        nextDay: document.getElementById("nextDay"),
        resetGame: document.getElementById("resetGame"),
        toggleHarvest: document.getElementById("toggleHarvest"),
        exploreForest: document.getElementById("exploreForest"),
        exploreCave: document.getElementById("exploreCave"),
        exploreSwamp: document.getElementById("exploreSwamp"),
        upgradeCore: document.getElementById("upgradeCore"),
        upgradePlants: document.getElementById("upgradePlants"),
        upgradePlayer: document.getElementById("upgradePlayer"),
        upgradeFarm: document.getElementById("upgradeFarm"),
        log: document.getElementById("log"),
        overlay: document.getElementById("overlay"),
        overlayTitle: document.getElementById("overlayTitle"),
        overlayBody: document.getElementById("overlayBody"),
        overlayActions: document.getElementById("overlayActions"),
      };

      const startScreen = document.getElementById("startScreen");
      const startButton = document.getElementById("startButton");
      let hasStarted = false;

      const rows = 5;
      const cols = 9;
      const cellSize = 70;
      const coreWidth = 80;
      const gridStartX = coreWidth;
      const gridEndX = gridStartX + cols * cellSize;
      const boardHeight = rows * cellSize;

      const phaseLabels = {
        persiapan: "Persiapan",
        pertahanan: "Pertahanan",
        eksplorasi: "Eksplorasi",
        upgrade: "Peningkatan",
      };

      const sceneTitles = {
        persiapan: "Hidup & Persiapan",
        pertahanan: "Pengepungan",
        eksplorasi: "Eksplorasi & Buru Material",
        upgrade: "Peningkatan Desa",
      };

      const plantDefs = {
        mage: {
          name: "Penyihir",
          cost: { benih: 1, koin: 12 },
          damage: 7,
          range: 220,
          cooldown: 1.1,
          hp: 48,
          color: "#3a7bd5",
          symbol: "M",
        },
        slow: {
          name: "Pelambat",
          cost: { benih: 1, koin: 10 },
          damage: 3,
          range: 200,
          cooldown: 1.5,
          hp: 52,
          slow: 0.45,
          slowDuration: 2.6,
          color: "#2a9d8f",
          symbol: "L",
        },
        heal: {
          name: "Penyembuh",
          cost: { benih: 1, koin: 14 },
          heal: 6,
          range: 120,
          cooldown: 2.2,
          hp: 44,
          color: "#7fb069",
          symbol: "H",
        },
        buff: {
          name: "Penguat",
          cost: { benih: 1, koin: 11 },
          buff: 0.25,
          hp: 60,
          color: "#f4a261",
          symbol: "U",
        },
      };

      const enemyDefs = {
        slime: { name: "Lendir", hp: 32, speed: 28, damage: 14, color: "#6ce0c6" },
        golem: { name: "Golem", hp: 70, speed: 16, damage: 22, color: "#a98467" },
        specter: { name: "Arwah", hp: 44, speed: 22, damage: 16, color: "#cdb4db" },
      };

      const weapons = [
        { name: "Sabit", damage: 8, cooldown: 0.35, speed: 520, color: "#f4d35e", radius: 4 },
        { name: "Tombak", damage: 14, cooldown: 0.7, speed: 420, color: "#ee964b", radius: 5 },
      ];

      const relicPool = [
        { name: "Relik Penjaga", effect: { coreMax: 15 } },
        { name: "Relik Bara", effect: { plantDamage: 0.1 } },
        { name: "Relik Pemburu", effect: { playerDamage: 0.1 } },
        { name: "Relik Embun", effect: { slowBonus: 0.1 } },
        { name: "Relik Panen", effect: { coinsBonus: 0.1 } },
      ];

      const tileSheets = {
        floors: { src: "assets/tiles/floors.png", tileSize: 16, columns: 25 },
        water: { src: "assets/tiles/water.png", tileSize: 16, columns: 25 },
      };

      const propSheets = {
        vegetation: { src: "assets/props/vegetation.png", tileSize: 16, columns: 25 },
        rocks: { src: "assets/props/rocks.png", tileSize: 16, columns: 13 },
      };

      const groundTiles = {
        normal: { sheet: "floors", x: 1, y: 10 },
        snow: { sheet: "floors", x: 0, y: 23 },
      };

      const waterTile = { sheet: "water", x: 8, y: 6 };
      const bushTile = { sheet: "vegetation", x: 1, y: 6 };
      const snowBushTile = { sheet: "vegetation", x: 4, y: 24 };
      const rockTile = { sheet: "rocks", x: 1, y: 2 };

      const mapSequence = [
        {
          id: "normal",
          label: "Normal",
          background: "assets/map/normal.png",
          focusY: 0.55,
          ground: groundTiles.normal,
          overlay: "none",
          props: { bush: bushTile, rock: rockTile },
          weather: { name: "Normal", desc: "Cuaca bersahabat", coinsBonus: 0, enemySpeed: 0, healBonus: 0 },
        },
        {
          id: "hujan",
          label: "Hujan",
          background: "assets/map/hujan.png",
          focusY: 0.55,
          ground: groundTiles.normal,
          overlay: "rain",
          props: { bush: bushTile, rock: rockTile },
          weather: { name: "Hujan", desc: "Tanaman lebih segar", coinsBonus: 0, enemySpeed: -0.05, healBonus: 0.15 },
        },
        {
          id: "malam",
          label: "Malam",
          background: "assets/map/malam.png",
          focusY: 0.55,
          ground: groundTiles.normal,
          overlay: "night",
          props: { bush: bushTile, rock: rockTile },
          weather: { name: "Malam", desc: "Gelap dan mencekam", coinsBonus: 0, enemySpeed: 0.08, healBonus: 0 },
        },
        {
          id: "salju",
          label: "Salju",
          background: "assets/map/salju.png",
          focusY: 0.55,
          ground: groundTiles.snow,
          overlay: "snow",
          props: { bush: snowBushTile, rock: rockTile },
          weather: { name: "Salju", desc: "Dingin memperlambat musuh", coinsBonus: 0, enemySpeed: -0.08, healBonus: 0.05 },
        },
      ];

      const maxWavesPerMap = 5;

      const spriteSheets = {
        player: {
          idleDown: { src: "assets/sprites/player/Idle_Down.png", frames: 4 },
          idleSide: { src: "assets/sprites/player/Idle_Side.png", frames: 4 },
          idleUp: { src: "assets/sprites/player/Idle_Up.png", frames: 4 },
          runDown: { src: "assets/sprites/player/Run_Down.png", frames: 6 },
          runSide: { src: "assets/sprites/player/Run_Side.png", frames: 6 },
          runUp: { src: "assets/sprites/player/Run_Up.png", frames: 6 },
          frameW: 64,
          frameH: 64,
        },
        enemies: {
          slime: { src: "assets/sprites/enemies/orc.png", frames: 6 },
          golem: { src: "assets/sprites/enemies/orc_warrior.png", frames: 6 },
          specter: { src: "assets/sprites/enemies/skeleton.png", frames: 6 },
          frameW: 64,
          frameH: 64,
        },
      };

      const spriteImages = {};
      let spritesLoaded = false;

      function loadSprites() {
        const sources = [];
        Object.values(spriteSheets.player).forEach((item) => {
          if (item && item.src) sources.push(item.src);
        });
        Object.values(spriteSheets.enemies).forEach((item) => {
          if (item && item.src) sources.push(item.src);
        });
        Object.values(tileSheets).forEach((item) => {
          if (item && item.src) sources.push(item.src);
        });
        Object.values(propSheets).forEach((item) => {
          if (item && item.src) sources.push(item.src);
        });
        mapSequence.forEach((map) => {
          if (map.background) sources.push(map.background);
        });
        let loaded = 0;
        const total = sources.length;
        if (!total) {
          spritesLoaded = true;
          return;
        }
        sources.forEach((src) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            loaded += 1;
            if (loaded >= total) {
              spritesLoaded = true;
            }
          };
          img.onerror = () => {
            loaded += 1;
            if (loaded >= total) {
              spritesLoaded = true;
            }
          };
          spriteImages[src] = img;
        });
      }

      function getSpriteImage(source) {
        const img = source ? spriteImages[source] : null;
        if (!img) return null;
        if (!img.complete || img.naturalWidth === 0) return null;
        return img;
      }

      let selectedPlant = "mage";
      let harvestMode = false;
      let selectedCell = { row: 2, col: 2 };
      let hoverCell = null;
      const keys = {};

      const game = {
        time: 0,
        mapIndex: 0,
        waveInMap: 1,
        mapCycle: 0,
        phase: "persiapan",
        coins: 60,
        materials: 4,
        trophies: 0,
        seeds: { mage: 0, slow: 0, heal: 0, buff: 0 },
        core: { hp: 120, maxHp: 120 },
        lives: 3,
        xp: 0,
        level: 1,
        skillPoints: 0,
        skills: { farming: 0, exploration: 0, combat: 0 },
        bonuses: {
          plantDamage: 0,
          playerDamage: 0,
          slowBonus: 0,
          coinsBonus: 0,
          plantCostDiscount: 0,
          dailySeedBonus: 0,
        },
        relics: [],
        weather: { name: "Normal", desc: "", coinsBonus: 0, enemySpeed: 0, healBonus: 0 },
        mapData: null,
        plants: [],
        enemies: [],
        projectiles: [],
        effects: [],
        waveTimer: 0,
        spawnQueue: [],
        kills: 0,
        paused: false,
        explorationDone: false,
        player: {
          x: gridStartX + 20,
          y: boardHeight / 2,
          speed: 140,
          weaponIndex: 0,
          cooldown: 0,
          invulnUntil: 0,
          dodgeUntil: 0,
          dodgeCooldownUntil: 0,
          facing: "down",
          moving: false,
          animTime: 0,
          hp: 100,
          maxHp: 100,
        },
      };

      function log(message) {
        const line = document.createElement("div");
        line.textContent = message;
        ui.log.prepend(line);
        if (ui.log.children.length > 12) {
          ui.log.removeChild(ui.log.lastChild);
        }
      }

      function showStartScreen() {
        if (!startScreen) return;
        startScreen.classList.remove("hidden");
      }

      function hideStartScreen() {
        if (!startScreen) return;
        startScreen.classList.add("hidden");
      }

      function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
      }

      function randRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      function createRng(seed) {
        let value = seed % 2147483647;
        if (value <= 0) value += 2147483646;
        return function () {
          value = (value * 16807) % 2147483647;
          return (value - 1) / 2147483646;
        };
      }

      function cellCenter(row, col) {
        return {
          x: gridStartX + col * cellSize + cellSize / 2,
          y: row * cellSize + cellSize / 2,
        };
      }

      function getCellAt(x, y) {
        if (x < gridStartX || x >= gridEndX) return null;
        const col = Math.floor((x - gridStartX) / cellSize);
        const row = Math.floor(y / cellSize);
        if (row < 0 || row >= rows) return null;
        return { row, col };
      }

      function grantDailySeeds() {
        const base = { mage: 1, slow: 1, heal: 1, buff: 1 };
        Object.keys(base).forEach((type) => {
          game.seeds[type] += base[type] + game.bonuses.dailySeedBonus;
        });
      }

      function buildMapData(mapIndex) {
        const tileSize = tileSheets.floors.tileSize;
        const scale = 2;
        const drawSize = tileSize * scale;
        const cols = Math.ceil(canvas.width / drawSize);
        const rows = Math.ceil(canvas.height / drawSize);
        const rng = createRng((mapIndex + 1) * 97);
        const riverCells = new Set();
        let riverX = Math.floor(cols * 0.55);
        for (let row = 0; row < rows; row += 1) {
          const drift = Math.floor(rng() * 3) - 1;
          riverX = clamp(riverX + drift, 3, cols - 4);
          const width = row % 3 === 0 ? 3 : 2;
          for (let w = 0; w < width; w += 1) {
            riverCells.add(`${row},${riverX + w}`);
          }
        }

        const props = [];
        const propCount = Math.floor((cols * rows) / 10);
        const used = new Set(riverCells);
        for (let i = 0; i < propCount; i += 1) {
          const col = Math.floor(rng() * (cols - 2)) + 1;
          const row = Math.floor(rng() * rows);
          const key = `${row},${col}`;
          if (used.has(key) || col < 3) continue;
          used.add(key);
          const type = rng() < 0.7 ? "bush" : "rock";
          props.push({ type, col, row });
        }

        return { cols, rows, drawSize, riverCells, props };
      }

      function applyMapTheme(silent = false) {
        const map = mapSequence[game.mapIndex];
        game.weather = { ...map.weather };
        game.mapData = buildMapData(game.mapIndex);
        if (!silent) {
          log(`Memasuki peta ${map.label}. ${map.weather.desc}`);
        }
      }

      function costWithDiscount(baseCost) {
        const discount = 1 - clamp(game.bonuses.plantCostDiscount, 0, 0.5);
        return Math.max(0, Math.ceil(baseCost * discount));
      }

      function getPlantAt(row, col) {
        return game.plants.find((plant) => plant.row === row && plant.col === col);
      }

      function placePlant(row, col) {
        if (game.phase !== "persiapan") {
          log("Tanam hanya saat fase persiapan.");
          return;
        }

        if (harvestMode) {
          harvestPlant(row, col);
          return;
        }

        if (getPlantAt(row, col)) {
          log("Lahan sudah terisi.");
          return;
        }

        const def = plantDefs[selectedPlant];
        if (game.seeds[selectedPlant] < def.cost.benih) {
          log("Benih tidak cukup.");
          return;
        }

        const coinCost = costWithDiscount(def.cost.koin);
        if (game.coins < coinCost) {
          log("Koin tidak cukup.");
          return;
        }

        game.seeds[selectedPlant] -= def.cost.benih;
        game.coins -= coinCost;

        game.plants.push({
          row,
          col,
          type: selectedPlant,
          hp: def.hp,
          maxHp: def.hp,
          cooldown: 0,
        });

        log(`Menanam ${def.name} di baris ${row + 1}.`);
        updateUI();
      }

      function harvestPlant(row, col) {
        const plant = getPlantAt(row, col);
        if (!plant) {
          log("Tidak ada tanaman untuk dipanen.");
          return;
        }
        game.plants = game.plants.filter((item) => item !== plant);
        const base = 8;
        const bonus =
          1 + game.skills.farming * 0.05 + game.bonuses.coinsBonus + game.weather.coinsBonus;
        const gain = Math.round(base * bonus);
        game.coins += gain;
        log(`Panen berhasil, koin +${gain}.`);
        updateUI();
      }

      function startDefense() {
        if (game.phase !== "persiapan") return;
        game.phase = "pertahanan";
        game.waveTimer = 0;
        game.spawnQueue = createWave(game.waveInMap);
        game.kills = 0;
        game.lives = 3;
        game.explorationDone = false;
        game.player.x = gridStartX + 20;
        game.player.y = boardHeight / 2;
        log(
          `Gelombang ${game.waveInMap} dimulai di peta ${mapSequence[game.mapIndex].label}.`
        );
        updateUI();
      }

      function createWave(wave) {
        const difficulty = wave <= 3 ? "mudah" : wave === 4 ? "normal" : "sulit";
        let total = 8 + wave * 2;
        let timeGap = 1.15;
        let pool = [
          { type: "slime", weight: 0.7 },
          { type: "specter", weight: 0.3 },
        ];
        if (difficulty === "normal") {
          total = 12;
          timeGap = 1.0;
          pool = [
            { type: "slime", weight: 0.5 },
            { type: "specter", weight: 0.3 },
            { type: "golem", weight: 0.2 },
          ];
        } else if (difficulty === "sulit") {
          total = 15;
          timeGap = 0.9;
          pool = [
            { type: "slime", weight: 0.4 },
            { type: "specter", weight: 0.3 },
            { type: "golem", weight: 0.3 },
          ];
        }

        const pickType = () => {
          const roll = Math.random();
          let acc = 0;
          for (const item of pool) {
            acc += item.weight;
            if (roll <= acc) return item.type;
          }
          return pool[0].type;
        };

        const queue = [];
        for (let i = 0; i < total; i += 1) {
          const time = i * timeGap + Math.random() * 0.4;
          const type = pickType();
          queue.push({ time, row: randRange(0, rows - 1), type });
        }
        return queue.sort((a, b) => a.time - b.time);
      }

      function endDefense() {
        if (game.phase !== "pertahanan") return;
        game.phase = "eksplorasi";
        const harvest = Math.round(
          game.plants.length * (2 + game.skills.farming * 0.4)
        );
        const killReward = game.kills * 2;
        const lootBonus = 1 + game.bonuses.coinsBonus + game.weather.coinsBonus;
        game.coins += Math.round((harvest + killReward) * lootBonus);
        game.materials += Math.max(1, Math.floor(game.waveInMap / 2));
        game.trophies += 1;
        grantDailySeeds();
        gainXp(10 + game.waveInMap * 4 + game.kills);
        log("Pertahanan sukses. Waktunya eksplorasi.");
        if (game.waveInMap >= maxWavesPerMap) {
          log("Gelombang terakhir di peta ini selesai. Lanjutkan ke peta berikutnya.");
        }
        updateUI();
      }

      function gainXp(amount) {
        game.xp += amount;
        const threshold = game.level * 18;
        if (game.xp >= threshold) {
          game.xp -= threshold;
          game.level += 1;
          game.skillPoints += 1;
          log("Level naik! Kamu mendapat 1 poin kemampuan.");
        }
      }

      function openUpgradePhase() {
        if (game.phase !== "eksplorasi" || !game.explorationDone) {
          return;
        }
        game.phase = "upgrade";
        log("Masuk fase peningkatan dan bertani.");
        updateUI();
      }

      function nextDay() {
        if (game.phase !== "upgrade") return;
        const completedMap = game.waveInMap >= maxWavesPerMap;
        if (completedMap) {
          game.waveInMap = 1;
          game.mapIndex += 1;
          if (game.mapIndex >= mapSequence.length) {
            game.mapIndex = 0;
            game.mapCycle += 1;
            log("Semua peta selesai. Siklus baru dimulai.");
          }
          applyMapTheme(true);
          log(`Pindah ke peta ${mapSequence[game.mapIndex].label}.`);
        } else {
          game.waveInMap += 1;
        }
        game.phase = "persiapan";
        game.player.hp = game.player.maxHp;
        log(`Persiapan gelombang ${game.waveInMap}. Siapkan pertahanan baru.`);
        updateUI();
      }

      function exploreArea(area) {
        if (game.phase !== "eksplorasi" || game.explorationDone) return;
        const mult = 1 + game.skills.exploration * 0.08;
        let loot = {
          coins: randRange(8, 14),
          materials: randRange(1, 3),
          seeds: { mage: 0, slow: 0, heal: 0, buff: 0 },
          relicChance: 0.2,
        };

        if (area === "hutan") {
          loot.coins = randRange(12, 20);
          loot.seeds.mage = 1;
          loot.seeds.slow = 1;
          loot.relicChance = 0.15;
        } else if (area === "gua") {
          loot.coins = randRange(8, 14);
          loot.materials = randRange(2, 4);
          loot.seeds.slow = 1;
          loot.relicChance = 0.25;
        } else {
          loot.coins = randRange(6, 12);
          loot.seeds.heal = 1;
          loot.seeds.buff = 1;
          loot.relicChance = 0.22;
        }

        const coinBonus = 1 + game.bonuses.coinsBonus + game.weather.coinsBonus;
        game.coins += Math.round(loot.coins * mult * coinBonus);
        game.materials += Math.round(loot.materials * mult);
        Object.keys(loot.seeds).forEach((type) => {
          game.seeds[type] += loot.seeds[type];
        });

        if (Math.random() < loot.relicChance) {
          const relic = relicPool[randRange(0, relicPool.length - 1)];
          applyRelic(relic);
          log(`Menemukan ${relic.name}.`);
        }

        game.explorationDone = true;
        log("Eksplorasi selesai. Lanjut ke peningkatan.");
        updateUI();
      }

      function applyRelic(relic) {
        game.relics.push(relic.name);
        if (relic.effect.coreMax) {
          game.core.maxHp += relic.effect.coreMax;
          game.core.hp = Math.min(game.core.maxHp, game.core.hp + relic.effect.coreMax);
        }
        if (relic.effect.plantDamage) game.bonuses.plantDamage += relic.effect.plantDamage;
        if (relic.effect.playerDamage) game.bonuses.playerDamage += relic.effect.playerDamage;
        if (relic.effect.slowBonus) game.bonuses.slowBonus += relic.effect.slowBonus;
        if (relic.effect.coinsBonus) game.bonuses.coinsBonus += relic.effect.coinsBonus;
      }

      function upgradeCore() {
        const costCoin = 26;
        const costMat = 4;
        if (game.coins < costCoin || game.materials < costMat) {
          log("Material atau koin kurang.");
          return;
        }
        game.coins -= costCoin;
        game.materials -= costMat;
        game.core.maxHp += 20;
        game.core.hp += 20;
        log("Inti desa lebih kuat.");
        updateUI();
      }

      function upgradePlants() {
        const costCoin = 30;
        const costMat = 4;
        if (game.coins < costCoin || game.materials < costMat) {
          log("Material atau koin kurang.");
          return;
        }
        game.coins -= costCoin;
        game.materials -= costMat;
        game.bonuses.plantDamage += 0.1;
        log("Tanaman mendapat bonus serangan.");
        updateUI();
      }

      function upgradePlayer() {
        const costCoin = 32;
        const costMat = 3;
        if (game.coins < costCoin || game.materials < costMat) {
          log("Material atau koin kurang.");
          return;
        }
        game.coins -= costCoin;
        game.materials -= costMat;
        game.bonuses.playerDamage += 0.1;
        log("Senjata petani lebih tajam.");
        updateUI();
      }

      function upgradeFarm() {
        const costCoin = 24;
        const costMat = 2;
        if (game.coins < costCoin || game.materials < costMat) {
          log("Material atau koin kurang.");
          return;
        }
        game.coins -= costCoin;
        game.materials -= costMat;
        game.bonuses.dailySeedBonus += 1;
        game.bonuses.plantCostDiscount += 0.05;
        log("Ladang lebih produktif setiap hari.");
        updateUI();
      }

      function showOverlay(title, bodyHtml, actions) {
        ui.overlayTitle.textContent = title;
        ui.overlayBody.innerHTML = bodyHtml;
        ui.overlayActions.innerHTML = "";
        actions.forEach((action) => {
          const button = document.createElement("button");
          button.type = "button";
          button.textContent = action.label;
          if (action.className) button.className = action.className;
          button.addEventListener("click", action.onClick);
          ui.overlayActions.appendChild(button);
        });
        ui.overlay.classList.add("show");
        game.paused = true;
      }

      function hideOverlay() {
        ui.overlay.classList.remove("show");
        ui.overlayTitle.textContent = "";
        ui.overlayBody.innerHTML = "";
        ui.overlayActions.innerHTML = "";
        game.paused = !hasStarted;
      }

      function showVictory() {
        showOverlay(
          "Desa Bertahan",
          "<p>Kamu berhasil melewati gelombang utama. Desa merayakan kemenangan!</p>",
          [
            {
              label: "Lanjut Main",
              onClick: () => {
                hideOverlay();
              },
            },
            { label: "Tutup", className: "secondary", onClick: hideOverlay },
          ]
        );
      }

      function showGameOver() {
        showOverlay(
          "Desa Runtuh",
          "<p>Inti desa hancur atau nyawa petani habis. Coba strategi baru.</p>",
          [
            {
              label: "Ulang",
              onClick: () => {
                hideOverlay();
                resetGame();
              },
            },
            { label: "Tutup", className: "secondary", onClick: hideOverlay },
          ]
        );
      }

      function renderPlantList() {
        ui.plantList.innerHTML = "";
        Object.keys(plantDefs).forEach((type) => {
          const def = plantDefs[type];
          const button = document.createElement("button");
          button.type = "button";
          button.className = "plant-btn";
          if (selectedPlant === type) button.classList.add("active");
          const coinCost = costWithDiscount(def.cost.koin);
          button.innerHTML = `
            <div class="plant-name">${def.name}</div>
            <div class="plant-cost">Benih ${game.seeds[type]} | Koin ${coinCost}</div>
          `;
          button.addEventListener("click", () => {
            selectedPlant = type;
            renderPlantList();
          });
          ui.plantList.appendChild(button);
        });
      }

      function updateUI() {
        ui.waveValue.textContent = `${game.waveInMap}/${maxWavesPerMap}`;
        ui.mapValue.textContent = mapSequence[game.mapIndex].label;
        ui.trophyValue.textContent = game.trophies;
        ui.levelValue.textContent = game.level;
        ui.weatherValue.textContent = game.weather.name;
        ui.sceneTag.textContent = `${sceneTitles[game.phase]} - ${mapSequence[game.mapIndex].label}`;
        ui.coinsValue.textContent = game.coins;
        ui.materialValue.textContent = game.materials;
        ui.seedMageValue.textContent = game.seeds.mage;
        ui.seedSlowValue.textContent = game.seeds.slow;
        ui.seedHealValue.textContent = game.seeds.heal;
        ui.seedBuffValue.textContent = game.seeds.buff;
        ui.coreValue.textContent = `${Math.round(game.core.hp)}/${game.core.maxHp}`;
        ui.lifeValue.textContent = game.lives;
        ui.statusText.textContent = `Fase: ${phaseLabels[game.phase]}`;
        ui.weaponText.textContent = `Senjata: ${weapons[game.player.weaponIndex].name}`;

        ui.startDefense.disabled = game.phase !== "persiapan";
        ui.toUpgrade.disabled = !(game.phase === "eksplorasi" && game.explorationDone);
        ui.nextDay.disabled = game.phase !== "upgrade";

        ui.explorePanel.classList.toggle("hidden", game.phase !== "eksplorasi");
        ui.upgradePanel.classList.toggle("hidden", game.phase !== "upgrade");

        if (game.phase === "persiapan") {
          ui.phaseDesc.textContent =
            "Siapkan tanaman dan formasi sebelum gelombang musuh datang.";
        } else if (game.phase === "pertahanan") {
          ui.phaseDesc.textContent = "Pertahankan Inti Desa dari serangan monster.";
        } else if (game.phase === "eksplorasi") {
          ui.phaseDesc.textContent =
            "Jelajahi area untuk mencari benih, material, dan relik.";
        } else if (game.phase === "upgrade") {
          ui.phaseDesc.textContent = "Tingkatkan desa, senjata, dan tanaman.";
        }

        renderPlantList();
      }

      function findEnemyInRange(plant) {
        const def = plantDefs[plant.type];
        const center = cellCenter(plant.row, plant.col);
        let target = null;
        let closest = Infinity;
        game.enemies.forEach((enemy) => {
          if (enemy.row !== plant.row) return;
          const dist = Math.abs(enemy.x - center.x);
          if (dist <= def.range && dist < closest) {
            closest = dist;
            target = enemy;
          }
        });
        return target;
      }

      function getBuffMultiplier(plant) {
        let bonus = 0;
        game.plants.forEach((item) => {
          if (item.type !== "buff") return;
          const distRow = Math.abs(item.row - plant.row);
          const distCol = Math.abs(item.col - plant.col);
          if (distRow <= 1 && distCol <= 1) {
            bonus += plantDefs.buff.buff;
          }
        });
        return 1 + bonus;
      }

      function updatePlants(dt) {
        const now = performance.now() / 1000;
        game.plants.forEach((plant) => {
          plant.cooldown -= dt;
          const def = plantDefs[plant.type];

          if (plant.type === "heal") {
            if (plant.cooldown <= 0) {
              const healAmount =
                def.heal * (1 + game.bonuses.plantDamage + game.weather.healBonus);
              game.plants.forEach((target) => {
                const distRow = Math.abs(target.row - plant.row);
                const distCol = Math.abs(target.col - plant.col);
                if (distRow <= 1 && distCol <= 1) {
                  target.hp = Math.min(target.maxHp, target.hp + healAmount);
                }
              });
              game.core.hp = Math.min(game.core.maxHp, game.core.hp + healAmount * 0.3);
              plant.cooldown = def.cooldown;
              return;
            }
          }

          if (plant.type === "buff") return;

          if (plant.cooldown <= 0) {
            const enemy = findEnemyInRange(plant);
            if (!enemy) return;
            const multiplier =
              (1 + game.bonuses.plantDamage) * getBuffMultiplier(plant);
            const damage = def.damage * multiplier;
            enemy.hp -= damage;
            if (plant.type === "slow") {
              enemy.slowUntil = Math.max(
                enemy.slowUntil,
                now + def.slowDuration
              );
              enemy.slowFactor = Math.max(
                0.2,
                1 - def.slow - game.bonuses.slowBonus
              );
            }
            const center = cellCenter(plant.row, plant.col);
            game.effects.push({
              x1: center.x,
              y1: center.y,
              x2: enemy.x,
              y2: enemy.y,
              ttl: 0.15,
              color: def.color,
            });
            plant.cooldown = def.cooldown;
          }
        });
      }

      function findBlockingPlant(enemy) {
        let target = null;
        let targetX = -Infinity;
        game.plants.forEach((plant) => {
          if (plant.row !== enemy.row) return;
          const center = cellCenter(plant.row, plant.col);
          if (center.x < enemy.x && center.x > targetX) {
            target = plant;
            targetX = center.x;
          }
        });
        if (!target) return null;
        if (enemy.x - targetX <= cellSize * 0.25) {
          return target;
        }
        return null;
      }

      function updateEnemies(dt) {
        const now = performance.now() / 1000;
        game.enemies.forEach((enemy) => {
          const targetPlant = findBlockingPlant(enemy);
          if (targetPlant) {
            enemy.attackCooldown -= dt;
            if (enemy.attackCooldown <= 0) {
              targetPlant.hp -= enemy.damage;
              enemy.attackCooldown = enemy.attackRate;
              if (targetPlant.hp <= 0) {
                game.plants = game.plants.filter((plant) => plant !== targetPlant);
                log("Satu tanaman hancur.");
              }
            }
            return;
          }

          let speed = enemy.speed;
          if (now < enemy.slowUntil) {
            speed *= enemy.slowFactor;
          }
          enemy.x -= speed * dt;

          const dx = enemy.x - game.player.x;
          const dy = enemy.y - game.player.y;
          if (dx * dx + dy * dy < 220 && now > game.player.invulnUntil) {
            const damage = Math.max(6, enemy.damage * 0.6);
            game.player.hp -= damage;
            game.player.invulnUntil = now + 1;
            log("Petani terkena serangan.");
            if (game.player.hp <= 0) {
              game.lives -= 1;
              game.lives = Math.max(0, game.lives);
              game.player.hp = game.player.maxHp;
              log("Petani tumbang. Nyawa berkurang.");
            }
          }

          if (enemy.x <= coreWidth + 8) {
            game.core.hp -= enemy.damage;
            enemy.hp = 0;
            enemy.reachedCore = true;
            log("Inti desa diserang.");
          }
        });
      }

      function cleanupEnemies() {
        game.enemies.forEach((enemy) => {
          if (enemy.hp <= 0 && !enemy.counted && !enemy.reachedCore) {
            enemy.counted = true;
            game.kills += 1;
          }
        });
        game.enemies = game.enemies.filter((enemy) => enemy.hp > 0);
      }

      function updateProjectiles(dt) {
        game.projectiles.forEach((shot) => {
          if (shot.hit) return;
          shot.x += shot.vx * dt;
          shot.y += shot.vy * dt;
          for (const enemy of game.enemies) {
            if (enemy.hp <= 0) continue;
            const dx = enemy.x - shot.x;
            const dy = enemy.y - shot.y;
            if (dx * dx + dy * dy <= shot.radius * shot.radius * 9) {
              enemy.hp -= shot.damage;
              shot.hit = true;
              break;
            }
          }
          if (
            shot.x < 0 ||
            shot.x > canvas.width ||
            shot.y < 0 ||
            shot.y > canvas.height
          ) {
            shot.hit = true;
          }
        });

        game.projectiles = game.projectiles.filter((shot) => !shot.hit);
      }

      function updateEffects(dt) {
        game.effects.forEach((effect) => {
          effect.ttl -= dt;
        });
        game.effects = game.effects.filter((effect) => effect.ttl > 0);
      }

      function shootAt(targetX, targetY) {
        if (game.phase !== "pertahanan") return;
        if (game.player.cooldown > 0) return;
        const weapon = weapons[game.player.weaponIndex];
        const dx = targetX - game.player.x;
        const dy = targetY - game.player.y;
        const dist = Math.hypot(dx, dy) || 1;
        const vx = (dx / dist) * weapon.speed;
        const vy = (dy / dist) * weapon.speed;
        const damage = weapon.damage * (1 + game.bonuses.playerDamage + game.skills.combat * 0.03);
        game.projectiles.push({
          x: game.player.x,
          y: game.player.y,
          vx,
          vy,
          damage,
          radius: weapon.radius,
          color: weapon.color,
          hit: false,
        });
        game.player.cooldown = weapon.cooldown;
      }

      function updatePlayer(dt) {
        if (game.phase !== "pertahanan") {
          game.player.moving = false;
          game.player.animTime += dt * 0.35;
          return;
        }
        let speed = game.player.speed;
        const now = performance.now() / 1000;
        if (now < game.player.dodgeUntil) {
          speed *= 1.8;
        }

        let vx = 0;
        let vy = 0;
        if (keys.w) vy -= 1;
        if (keys.s) vy += 1;
        if (keys.a) vx -= 1;
        if (keys.d) vx += 1;
        if (vx || vy) {
          const len = Math.hypot(vx, vy) || 1;
          game.player.x += (vx / len) * speed * dt;
          game.player.y += (vy / len) * speed * dt;
        }

        const moving = Boolean(vx || vy);
        if (moving) {
          if (Math.abs(vx) > Math.abs(vy)) {
            game.player.facing = vx < 0 ? "left" : "right";
          } else {
            game.player.facing = vy < 0 ? "up" : "down";
          }
        }
        game.player.moving = moving;
        game.player.animTime += dt * (moving ? 1 : 0.4);

        game.player.x = clamp(game.player.x, 10, canvas.width - 10);
        game.player.y = clamp(game.player.y, 10, canvas.height - 10);

        if (game.player.cooldown > 0) {
          game.player.cooldown -= dt;
        }
      }

      function updateGame(dt) {
        if (game.paused) return;

        game.time += dt;
        updatePlayer(dt);

        if (game.phase === "pertahanan") {
          game.waveTimer += dt;
          while (game.spawnQueue.length && game.spawnQueue[0].time <= game.waveTimer) {
            const spawn = game.spawnQueue.shift();
            spawnEnemy(spawn.type, spawn.row);
          }
          updatePlants(dt);
          updateEnemies(dt);
          updateProjectiles(dt);
          updateEffects(dt);
          cleanupEnemies();

          if (!game.spawnQueue.length && !game.enemies.length) {
            endDefense();
          }
        }

        if (!game.paused && (game.core.hp <= 0 || game.lives <= 0)) {
          showGameOver();
        }
      }

      function spawnEnemy(type, row) {
        const def = enemyDefs[type];
        const center = cellCenter(row, cols - 1);
        const speed = Math.max(6, def.speed * (1 + game.weather.enemySpeed));
        game.enemies.push({
          type,
          row,
          x: gridEndX + 20,
          y: center.y,
          hp: def.hp,
          maxHp: def.hp,
          speed,
          damage: def.damage,
          color: def.color,
          slowUntil: 0,
          slowFactor: 1,
          attackRate: 0.8,
          attackCooldown: 0.4,
          reachedCore: false,
          counted: false,
          animOffset: Math.random() * 4,
        });
      }

      function drawCloud(x, y, scale, alpha) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#fff5e6";
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.arc(20, -6, 22, 0, Math.PI * 2);
        ctx.arc(42, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      function drawHill(y, height, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(
          canvas.width * 0.25,
          y - height,
          canvas.width * 0.55,
          y + height * 0.25,
          canvas.width,
          y - height * 0.6
        );
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fill();
      }

      function drawTree(x, y, scale, night) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.fillStyle = night ? "#3b2a1a" : "#7b4a24";
        ctx.fillRect(-4, 0, 8, 18);
        ctx.fillStyle = night ? "#2f4f2e" : "#4f8f2d";
        ctx.beginPath();
        ctx.arc(0, -6, 16, 0, Math.PI * 2);
        ctx.arc(-10, 2, 12, 0, Math.PI * 2);
        ctx.arc(12, 2, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      function drawBackground() {
        if (!spritesLoaded || !game.mapData) {
          const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
          gradient.addColorStop(0, "#8fd5ff");
          gradient.addColorStop(0.55, "#cfe9ff");
          gradient.addColorStop(1, "#f1d3a7");
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          return;
        }

        if (!drawMapBase()) {
          ctx.fillStyle = "#88c26e";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        drawMapProps();
        drawWeatherOverlay();
      }

      function drawGrid() {
        const isDefense = game.phase === "pertahanan";
        const light = isDefense ? "rgba(112, 80, 55, 0.35)" : "rgba(155, 106, 63, 0.35)";
        const dark = isDefense ? "rgba(93, 63, 42, 0.45)" : "rgba(135, 84, 47, 0.45)";
        for (let row = 0; row < rows; row += 1) {
          for (let col = 0; col < cols; col += 1) {
            const x = gridStartX + col * cellSize;
            const y = row * cellSize;
            ctx.fillStyle = (row + col) % 2 === 0 ? light : dark;
            ctx.fillRect(x, y, cellSize, cellSize);
          }
        }
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        for (let row = 0; row <= rows; row += 1) {
          ctx.beginPath();
          ctx.moveTo(gridStartX, row * cellSize);
          ctx.lineTo(gridEndX, row * cellSize);
          ctx.stroke();
        }
        for (let col = 0; col <= cols; col += 1) {
          ctx.beginPath();
          ctx.moveTo(gridStartX + col * cellSize, 0);
          ctx.lineTo(gridStartX + col * cellSize, boardHeight);
          ctx.stroke();
        }
      }

      function drawCore() {
        ctx.fillStyle = "#e3caa2";
        ctx.fillRect(0, 0, coreWidth, boardHeight);

        const houseWidth = coreWidth - 18;
        const houseHeight = 60;
        const houseX = 9;
        const houseY = 44;

        ctx.fillStyle = "#f1d1a1";
        ctx.fillRect(houseX, houseY, houseWidth, houseHeight);
        ctx.fillStyle = "#d89b57";
        ctx.beginPath();
        ctx.moveTo(houseX - 4, houseY);
        ctx.lineTo(houseX + houseWidth / 2, houseY - 20);
        ctx.lineTo(houseX + houseWidth + 4, houseY);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#9c6a3b";
        ctx.fillRect(houseX + 6, houseY + 18, 12, 18);
        ctx.fillStyle = "#7d4f2b";
        ctx.fillRect(houseX + houseWidth - 18, houseY + 18, 12, 12);

        ctx.fillStyle = "#7b4a24";
        ctx.fillRect(houseX + houseWidth / 2 - 6, houseY + 26, 12, 22);
        ctx.fillStyle = "#f5d28f";
        ctx.fillRect(houseX + houseWidth / 2 - 2, houseY + 30, 4, 6);

        ctx.fillStyle = "#c28c52";
        for (let y = 6; y < boardHeight; y += 18) {
          ctx.fillRect(coreWidth - 6, y, 4, 10);
        }

        const barWidth = coreWidth - 16;
        const ratio = clamp(game.core.hp / game.core.maxHp, 0, 1);
        ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
        ctx.fillRect(8, boardHeight - 18, barWidth, 8);
        ctx.fillStyle = "#8ee26b";
        ctx.fillRect(8, boardHeight - 18, barWidth * ratio, 8);
        ctx.fillStyle = "#4b2b15";
        ctx.font = "bold 11px Baloo 2";
        ctx.fillText("INTI", 12, 20);
      }

      function drawSpriteFrame(img, frameIndex, x, y, frameW, frameH, scale, flip) {
        if (!img) return false;
        const sx = frameIndex * frameW;
        const sy = 0;
        const dw = frameW * scale;
        const dh = frameH * scale;
        ctx.save();
        ctx.translate(Math.round(x), Math.round(y));
        if (flip) {
          ctx.scale(-1, 1);
        }
        ctx.drawImage(img, sx, sy, frameW, frameH, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
        return true;
      }

      function getTileSheet(tileDef) {
        return tileSheets[tileDef.sheet] || propSheets[tileDef.sheet];
      }

      function drawTile(tileDef, dx, dy, scale) {
        const sheet = getTileSheet(tileDef);
        if (!sheet) return;
        const img = getSpriteImage(sheet.src);
        if (!img) return;
        const ts = sheet.tileSize;
        const sx = tileDef.x * ts;
        const sy = tileDef.y * ts;
        const size = ts * scale;
        ctx.drawImage(img, sx, sy, ts, ts, Math.round(dx), Math.round(dy), size, size);
      }

      function drawCoverImage(img, dx, dy, dWidth, dHeight, focusX = 0.5, focusY = 0.5) {
        const imgRatio = img.width / img.height;
        const destRatio = dWidth / dHeight;
        let sWidth = img.width;
        let sHeight = img.height;
        if (imgRatio > destRatio) {
          sWidth = img.height * destRatio;
        } else {
          sHeight = img.width / destRatio;
        }
        const sx = clamp(img.width * focusX - sWidth / 2, 0, img.width - sWidth);
        const sy = clamp(img.height * focusY - sHeight / 2, 0, img.height - sHeight);
        ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
      }

      function drawMapBase() {
        const map = mapSequence[game.mapIndex];
        if (!map) return false;
        if (map.background) {
          const img = getSpriteImage(map.background);
          if (img) {
            drawCoverImage(img, 0, 0, canvas.width, canvas.height, 0.5, map.focusY ?? 0.5);
            return true;
          }
        }
        if (!game.mapData) return false;
        const data = game.mapData;
        for (let row = 0; row < data.rows; row += 1) {
          for (let col = 0; col < data.cols; col += 1) {
            const key = `${row},${col}`;
            const tile = data.riverCells.has(key) ? waterTile : map.ground;
            drawTile(tile, col * data.drawSize, row * data.drawSize, 2);
          }
        }
        return true;
      }

      function drawMapProps() {
        const map = mapSequence[game.mapIndex];
        if (!map || !game.mapData) return;
        if (map.background) return;
        const data = game.mapData;
        data.props.forEach((prop) => {
          const tile = prop.type === "rock" ? map.props.rock : map.props.bush;
          drawTile(tile, prop.col * data.drawSize, prop.row * data.drawSize, 2);
        });
      }

      function drawWeatherOverlay() {
        const map = mapSequence[game.mapIndex];
        if (!map) return;
        if (map.overlay === "night") {
          ctx.fillStyle = "rgba(15, 20, 40, 0.45)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
          ctx.beginPath();
          ctx.arc(canvas.width * 0.65, canvas.height * 0.25, 80, 0, Math.PI * 2);
          ctx.fill();
        } else if (map.overlay === "rain") {
          ctx.strokeStyle = "rgba(180, 210, 240, 0.6)";
          ctx.lineWidth = 1;
          for (let i = 0; i < 60; i += 1) {
            const x = (i * 37 + game.time * 140) % (canvas.width + 60) - 30;
            const y = (i * 91 + game.time * 220) % (canvas.height + 60) - 30;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 6, y + 14);
            ctx.stroke();
          }
        } else if (map.overlay === "snow") {
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          for (let i = 0; i < 70; i += 1) {
            const x = (i * 41 + game.time * 18) % (canvas.width + 20) - 10;
            const y = (i * 83 + game.time * 26) % (canvas.height + 20) - 10;
            ctx.beginPath();
            ctx.arc(x, y, 1.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      function drawPixelHeart(x, y, filled, pixel) {
        const pattern = [
          "01100110",
          "11111111",
          "11111111",
          "11111111",
          "01111110",
          "00111100",
          "00011000",
          "00000000",
        ];
        const base = filled ? "#6fe26c" : "#2f3b45";
        const highlight = filled ? "#a5f4a1" : "#3a4652";
        for (let row = 0; row < pattern.length; row += 1) {
          const line = pattern[row];
          for (let col = 0; col < line.length; col += 1) {
            if (line[col] === "1") {
              const isHighlight = filled && row <= 1;
              ctx.fillStyle = isHighlight ? highlight : base;
              ctx.fillRect(
                Math.round(x + col * pixel),
                Math.round(y + row * pixel),
                pixel,
                pixel
              );
            }
          }
        }
      }

      function drawPixelBar(x, y, width, height, ratio, fill, back, border) {
        const safeRatio = clamp(ratio, 0, 1);
        ctx.fillStyle = border;
        ctx.fillRect(x, y, width, height);
        ctx.fillStyle = back;
        ctx.fillRect(x + 1, y + 1, width - 2, height - 2);
        const innerWidth = Math.max(0, Math.round((width - 4) * safeRatio));
        ctx.fillStyle = fill;
        ctx.fillRect(x + 2, y + 2, innerWidth, height - 4);
      }

      function drawHud() {
        const panelX = 12;
        const panelY = 12;
        const panelW = 176;
        const panelH = 58;
        ctx.save();
        ctx.fillStyle = "rgba(20, 26, 36, 0.92)";
        ctx.fillRect(panelX, panelY, panelW, panelH);
        ctx.strokeStyle = "#d8b37a";
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX + 1, panelY + 1, panelW - 2, panelH - 2);

        const heartPixel = 2;
        const heartSize = 8 * heartPixel;
        const heartGap = 4;
        const maxHearts = 5;
        const heartsX = panelX + 10;
        const heartsY = panelY + 8;
        for (let i = 0; i < maxHearts; i += 1) {
          drawPixelHeart(
            heartsX + i * (heartSize + heartGap),
            heartsY,
            i < game.lives,
            heartPixel
          );
        }

        const barX = panelX + 10;
        const barW = panelW - 20;
        drawPixelBar(
          barX,
          panelY + 30,
          barW,
          10,
          game.player.hp / game.player.maxHp,
          "#7de065",
          "#2f3b2f",
          "#131018"
        );
        drawPixelBar(
          barX,
          panelY + 42,
          barW,
          10,
          game.core.hp / game.core.maxHp,
          "#e25b5b",
          "#3a2424",
          "#131018"
        );
        ctx.restore();
      }

      function drawPlantGlyph(type, x, y, color) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = "#5a3a22";
        ctx.beginPath();
        ctx.ellipse(0, 12, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#2f7a3b";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(0, -6);
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(-6, 2, 6, 10, -0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(6, 2, 6, 10, 0.6, 0, Math.PI * 2);
        ctx.fill();

        if (type === "mage") {
          ctx.fillStyle = "#e0f2ff";
          ctx.beginPath();
          ctx.arc(0, -10, 5, 0, Math.PI * 2);
          ctx.fill();
        } else if (type === "slow") {
          ctx.strokeStyle = "#f5f1e2";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, -6, 6, 0, Math.PI * 1.4);
          ctx.stroke();
        } else if (type === "heal") {
          ctx.strokeStyle = "#fefefe";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-4, -8);
          ctx.lineTo(4, -8);
          ctx.moveTo(0, -12);
          ctx.lineTo(0, -4);
          ctx.stroke();
        } else if (type === "buff") {
          ctx.strokeStyle = "#fff1c2";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, -6, 7, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      function drawPlants() {
        game.plants.forEach((plant) => {
          const def = plantDefs[plant.type];
          const center = cellCenter(plant.row, plant.col);
          drawPlantGlyph(plant.type, center.x, center.y, def.color);

          if (plant.type === "buff") {
            ctx.strokeStyle = "rgba(244,162,97,0.6)";
            ctx.beginPath();
            ctx.arc(center.x, center.y, 26, 0, Math.PI * 2);
            ctx.stroke();
          }

          const ratio = clamp(plant.hp / plant.maxHp, 0, 1);
          ctx.fillStyle = "rgba(0,0,0,0.2)";
          ctx.fillRect(center.x - 18, center.y - 26, 36, 4);
          ctx.fillStyle = "#a7f3d0";
          ctx.fillRect(center.x - 18, center.y - 26, 36 * ratio, 4);
        });
      }

      function drawEnemyBody(enemy) {
        const x = enemy.x;
        const y = enemy.y;
        if (enemy.type === "slime") {
          ctx.fillStyle = enemy.color;
          ctx.beginPath();
          ctx.arc(x, y, 14, Math.PI, 0);
          ctx.quadraticCurveTo(x + 14, y + 16, x, y + 18);
          ctx.quadraticCurveTo(x - 14, y + 16, x - 14, y);
          ctx.closePath();
          ctx.fill();
        } else if (enemy.type === "golem") {
          ctx.fillStyle = enemy.color;
          ctx.fillRect(x - 16, y - 16, 32, 32);
          ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
          ctx.fillRect(x - 16, y - 16, 10, 10);
          ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
          ctx.fillRect(x + 6, y + 6, 10, 10);
        } else {
          ctx.fillStyle = enemy.color;
          ctx.beginPath();
          ctx.arc(x, y - 4, 12, Math.PI, 0);
          ctx.lineTo(x + 12, y + 12);
          ctx.quadraticCurveTo(x + 6, y + 16, x, y + 12);
          ctx.quadraticCurveTo(x - 6, y + 16, x - 12, y + 12);
          ctx.closePath();
          ctx.fill();
        }

        ctx.fillStyle = "#1f1f1f";
        ctx.beginPath();
        ctx.arc(x - 5, y - 2, 2.5, 0, Math.PI * 2);
        ctx.arc(x + 5, y - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      function drawEnemies() {
        game.enemies.forEach((enemy) => {
          const spriteSet = spriteSheets.enemies[enemy.type];
          const frameW = spriteSheets.enemies.frameW;
          const frameH = spriteSheets.enemies.frameH;
          const img = spriteSet ? getSpriteImage(spriteSet.src) : null;
          const frames = spriteSet ? spriteSet.frames : 0;
          const frameIndex = frames
            ? Math.floor((game.time * 8 + enemy.animOffset) % frames)
            : 0;

          ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
          ctx.beginPath();
          ctx.ellipse(enemy.x, enemy.y + 16, 14, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          if (!drawSpriteFrame(img, frameIndex, enemy.x, enemy.y, frameW, frameH, 1.05, true)) {
            drawEnemyBody(enemy);
          }
          const ratio = clamp(enemy.hp / enemy.maxHp, 0, 1);
          ctx.fillStyle = "rgba(0,0,0,0.25)";
          ctx.fillRect(enemy.x - 16, enemy.y - 22, 32, 4);
          ctx.fillStyle = "#ffbe0b";
          ctx.fillRect(enemy.x - 16, enemy.y - 22, 32 * ratio, 4);
        });
      }

      function drawPlayer() {
        const now = performance.now() / 1000;
        const invuln = now < game.player.invulnUntil;
        const dodge = now < game.player.dodgeUntil;
        const sprites = spriteSheets.player;
        const frameW = sprites.frameW;
        const frameH = sprites.frameH;

        const facing = game.player.facing;
        const moving = game.player.moving;
        let sheet = sprites.idleDown;
        let frames = sheet.frames;
        let flip = false;

        if (moving) {
          if (facing === "up") {
            sheet = sprites.runUp;
          } else if (facing === "down") {
            sheet = sprites.runDown;
          } else {
            sheet = sprites.runSide;
            flip = facing === "left";
          }
          frames = sheet.frames;
        } else {
          if (facing === "up") {
            sheet = sprites.idleUp;
          } else if (facing === "down") {
            sheet = sprites.idleDown;
          } else {
            sheet = sprites.idleSide;
            flip = facing === "left";
          }
          frames = sheet.frames;
        }

        const img = getSpriteImage(sheet.src);
        const fps = moving ? 10 : 6;
        const frameIndex = Math.floor(game.player.animTime * fps) % frames;

        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.beginPath();
        ctx.ellipse(game.player.x, game.player.y + 18, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        if (!drawSpriteFrame(img, frameIndex, game.player.x, game.player.y, frameW, frameH, 1.1, flip)) {
          ctx.fillStyle = invuln ? "#f77f00" : "#f4d35e";
          ctx.beginPath();
          ctx.arc(game.player.x, game.player.y, 10, 0, Math.PI * 2);
          ctx.fill();
        }

        if (dodge) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(game.player.x, game.player.y + 6, 18, 0, Math.PI * 2);
          ctx.stroke();
        } else if (invuln) {
          ctx.strokeStyle = "rgba(255, 210, 120, 0.6)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(game.player.x, game.player.y + 6, 16, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      function drawProjectiles() {
        game.projectiles.forEach((shot) => {
          ctx.fillStyle = shot.color;
          ctx.beginPath();
          ctx.arc(shot.x, shot.y, shot.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
          ctx.beginPath();
          ctx.arc(shot.x - 1, shot.y - 1, Math.max(1, shot.radius * 0.5), 0, Math.PI * 2);
          ctx.fill();
        });
      }

      function drawEffects() {
        game.effects.forEach((effect) => {
          ctx.strokeStyle = effect.color;
          ctx.globalAlpha = clamp(effect.ttl / 0.15, 0, 1);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(effect.x1, effect.y1);
          ctx.lineTo(effect.x2, effect.y2);
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.lineWidth = 1;
        });
      }

      function drawSelection() {
        if (game.phase !== "persiapan") return;
        const cell = hoverCell || selectedCell;
        if (!cell) return;
        const x = gridStartX + cell.col * cellSize;
        const y = cell.row * cellSize;
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 3, y + 3, cellSize - 6, cellSize - 6);
        ctx.lineWidth = 1;
      }

      function draw() {
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
        if (game.phase === "persiapan" || game.phase === "pertahanan") {
          drawGrid();
        }
        drawCore();
        drawPlants();
        drawEnemies();
        drawPlayer();
        drawProjectiles();
        drawEffects();
        if (game.phase === "persiapan") {
          drawSelection();
        }
        drawHud();

        if (game.paused && hasStarted) {
          ctx.fillStyle = "rgba(0,0,0,0.35)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#fff";
          ctx.font = "bold 22px Changa One";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("JEDA", canvas.width / 2, canvas.height / 2);
          ctx.textAlign = "left";
          ctx.textBaseline = "alphabetic";
        }
      }

      function resetGame() {
        game.time = 0;
        game.mapIndex = 0;
        game.waveInMap = 1;
        game.mapCycle = 0;
        game.phase = "persiapan";
        game.coins = 60;
        game.materials = 4;
        game.trophies = 0;
        game.seeds = { mage: 0, slow: 0, heal: 0, buff: 0 };
        game.core = { hp: 120, maxHp: 120 };
        game.lives = 3;
        game.xp = 0;
        game.level = 1;
        game.skillPoints = 0;
        game.skills = { farming: 0, exploration: 0, combat: 0 };
        game.bonuses = {
          plantDamage: 0,
          playerDamage: 0,
          slowBonus: 0,
          coinsBonus: 0,
          plantCostDiscount: 0,
          dailySeedBonus: 0,
        };
        game.relics = [];
        game.weather = { name: "Normal", desc: "", coinsBonus: 0, enemySpeed: 0, healBonus: 0 };
        game.mapData = null;
        game.plants = [];
        game.enemies = [];
        game.projectiles = [];
        game.effects = [];
        game.spawnQueue = [];
        game.waveTimer = 0;
        game.explorationDone = false;
        game.kills = 0;
        game.paused = false;
        game.player = {
          x: gridStartX + 20,
          y: boardHeight / 2,
          speed: 140,
          weaponIndex: 0,
          cooldown: 0,
          invulnUntil: 0,
          dodgeUntil: 0,
          dodgeCooldownUntil: 0,
          facing: "down",
          moving: false,
          animTime: 0,
          hp: 100,
          maxHp: 100,
        };
        selectedPlant = "mage";
        selectedCell = { row: 2, col: 2 };
        hoverCell = null;
        harvestMode = false;
        ui.toggleHarvest.textContent = "Mode Panen: Mati";
        grantDailySeeds();
        ui.log.innerHTML = "";
        applyMapTheme();
        log("Gelombang baru dimulai. Tanam dan bersiap.");
        updateUI();
        if (!hasStarted) {
          showStartScreen();
        } else {
          hideStartScreen();
        }
      }

      function startGame() {
        hasStarted = true;
        game.paused = false;
        hideStartScreen();
        updateUI();
      }

      function openCharacterMenu() {
        const body = `
          <p>Level ${game.level} | XP ${game.xp} | Poin kemampuan ${game.skillPoints}</p>
          <div class="char-grid">
            <div class="char-item">
              <span>Bertani (bonus koin)</span>
              <button data-skill="farming">Tambah</button>
            </div>
            <div class="char-item">
              <span>Eksplorasi (hasil lebih besar)</span>
              <button data-skill="exploration">Tambah</button>
            </div>
            <div class="char-item">
              <span>Pertempuran (serangan petani)</span>
              <button data-skill="combat">Tambah</button>
            </div>
          </div>
        `;
        showOverlay("Menu Karakter", body, [
          { label: "Tutup", className: "secondary", onClick: hideOverlay },
        ]);
        ui.overlayBody.querySelectorAll("button[data-skill]").forEach((button) => {
          button.addEventListener("click", () => {
            if (game.skillPoints <= 0) return;
            const skill = button.dataset.skill;
            game.skills[skill] += 1;
            game.skillPoints -= 1;
            openCharacterMenu();
            updateUI();
          });
        });
      }

      ui.startDefense.addEventListener("click", startDefense);
      ui.toUpgrade.addEventListener("click", openUpgradePhase);
      ui.nextDay.addEventListener("click", nextDay);
      ui.resetGame.addEventListener("click", resetGame);
      if (startButton) {
        startButton.addEventListener("click", startGame);
      }
      ui.toggleHarvest.addEventListener("click", () => {
        harvestMode = !harvestMode;
        ui.toggleHarvest.textContent = `Mode Panen: ${harvestMode ? "Nyala" : "Mati"}`;
      });
      ui.exploreForest.addEventListener("click", () => exploreArea("hutan"));
      ui.exploreCave.addEventListener("click", () => exploreArea("gua"));
      ui.exploreSwamp.addEventListener("click", () => exploreArea("rawa"));
      ui.upgradeCore.addEventListener("click", upgradeCore);
      ui.upgradePlants.addEventListener("click", upgradePlants);
      ui.upgradePlayer.addEventListener("click", upgradePlayer);
      ui.upgradeFarm.addEventListener("click", upgradeFarm);

      function handleCanvasClick(event) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
        if (!hasStarted) return;

        if (game.phase === "pertahanan") {
          shootAt(x, y);
          return;
        }

        if (game.phase === "persiapan") {
          const cell = getCellAt(x, y);
          if (cell) {
            selectedCell = cell;
            placePlant(cell.row, cell.col);
          }
        }
      }

      canvas.addEventListener("mousemove", (event) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
        hoverCell = getCellAt(x, y);
      });

      canvas.addEventListener("mouseleave", () => {
        hoverCell = null;
      });

      canvas.addEventListener("click", handleCanvasClick);
      canvas.addEventListener(
        "wheel",
        (event) => {
          if (game.phase !== "pertahanan") return;
          event.preventDefault();
          const dir = event.deltaY > 0 ? 1 : -1;
          game.player.weaponIndex =
            (game.player.weaponIndex + dir + weapons.length) % weapons.length;
          updateUI();
        },
        { passive: false }
      );

      window.addEventListener("keydown", (event) => {
        const key = event.key.toLowerCase();
        if (!hasStarted) {
          if (key === "enter") {
            startGame();
          }
          return;
        }
        if (key === "escape") {
          if (ui.overlay.classList.contains("show")) {
            hideOverlay();
            return;
          }
          game.paused = !game.paused;
          return;
        }
        if (key === "e") {
          if (!ui.overlay.classList.contains("show")) {
            openCharacterMenu();
          }
          return;
        }
        if (game.paused) return;
        if (key === "f") {
          if (game.phase === "persiapan") {
            placePlant(selectedCell.row, selectedCell.col);
          }
          return;
        }
        if (event.code === "Space") {
          const now = performance.now() / 1000;
          if (game.phase === "pertahanan" && now > game.player.dodgeCooldownUntil) {
            game.player.dodgeUntil = now + 0.4;
            game.player.dodgeCooldownUntil = now + 1.6;
          }
          return;
        }

        keys[key] = true;

        if (game.phase !== "pertahanan") {
          if (key === "w") selectedCell.row = clamp(selectedCell.row - 1, 0, rows - 1);
          if (key === "s") selectedCell.row = clamp(selectedCell.row + 1, 0, rows - 1);
          if (key === "a") selectedCell.col = clamp(selectedCell.col - 1, 0, cols - 1);
          if (key === "d") selectedCell.col = clamp(selectedCell.col + 1, 0, cols - 1);
        }
      });

      window.addEventListener("keyup", (event) => {
        const key = event.key.toLowerCase();
        keys[key] = false;
      });

      let lastTime = performance.now();
      function loop(timestamp) {
        const now = timestamp;
        const dt = Math.min(0.033, (now - lastTime) / 1000);
        lastTime = now;
        updateGame(dt);
        draw();
        requestAnimationFrame(loop);
      }

      loadSprites();
      resetGame();
      requestAnimationFrame(loop);
