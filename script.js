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
        upgradePanel: document.getElementById("upgradePanel"),
        startDefense: document.getElementById("startDefense"),
        toUpgrade: document.getElementById("toUpgrade"),
        nextDay: document.getElementById("nextDay"),
        resetGame: document.getElementById("resetGame"),
        toggleHarvest: document.getElementById("toggleHarvest"),
        upgradeCore: document.getElementById("upgradeCore"),
        upgradePlants: document.getElementById("upgradePlants"),
        upgradePlayer: document.getElementById("upgradePlayer"),
        upgradeFarm: document.getElementById("upgradeFarm"),
        log: document.getElementById("log"),
        overlay: document.getElementById("overlay"),
        overlayTitle: document.getElementById("overlayTitle"),
        overlayBody: document.getElementById("overlayBody"),
        overlayActions: document.getElementById("overlayActions"),
        armorName: document.getElementById("armorName"),
        armorPreview: document.getElementById("armorPreview"),
        armorPrev: document.getElementById("armorPrev"),
        armorNext: document.getElementById("armorNext"),
        armorPrice: document.getElementById("armorPrice"),
        armorAction: document.getElementById("armorAction"),
        weaponName: document.getElementById("weaponName"),
        weaponPreview: document.getElementById("weaponPreview"),
        weaponPrev: document.getElementById("weaponPrev"),
        weaponNext: document.getElementById("weaponNext"),
        weaponPrice: document.getElementById("weaponPrice"),
        weaponAction: document.getElementById("weaponAction"),
        mapSelect: document.getElementById("mapSelect"),
        levelSelect: document.getElementById("levelSelect"),
        startDefenseAlt: document.getElementById("startDefenseAlt"),
        seedBarTitle: document.getElementById("seedBarTitle"),
        coinSlot: document.getElementById("coinSlot"),
        shopSlot: document.getElementById("shopSlot"),
        coinMenu: document.getElementById("coinMenu"),
        pauseButton: document.getElementById("pauseButton"),
        inventoryToggle: document.getElementById("inventoryToggle"),
        tasPanel: document.getElementById("tasPanel"),
        miniMapButton: document.getElementById("miniMapButton"),
      };

      const seedSlots = Array.from(document.querySelectorAll(".seed-slot"));

      const startScreen = document.getElementById("startScreen");
      const startButton = document.getElementById("startButton");
      const tutorialButton = document.getElementById("tutorialButton");
      let hasStarted = false;
      let shopUi = null;
      let overlayContext = "none";

      const rows = 6;
      const cols = 8;
      let cellSize = 70;
      const coreWidth = 0;
      let boardWidth = 0;
      let boardHeight = 0;
      let boardOffsetX = 0;
      let boardOffsetY = 0;
      let gridStartX = 0;
      let gridEndX = 0;
      const coreMarker = { x: 0.5, y: 0.18 };
      const farmRegion = { x: 0.07, y: 0.226, width: 0.856, height: 0.637 };
      const coreHitHeight = 28;

      function updateBoardLayout() {
        const farmX = Math.round(canvas.width * farmRegion.x);
        const farmY = Math.round(canvas.height * farmRegion.y);
        const farmWidth = Math.round(canvas.width * farmRegion.width);
        const farmHeight = Math.round(canvas.height * farmRegion.height);

        cellSize = Math.max(20, Math.floor(Math.min(farmWidth / cols, farmHeight / rows)));
        boardWidth = coreWidth + cols * cellSize;
        boardHeight = rows * cellSize;
        boardOffsetX = Math.round(farmX + (farmWidth - boardWidth) / 2);
        boardOffsetY = Math.round(farmY + (farmHeight - boardHeight) / 2);
        gridStartX = boardOffsetX + coreWidth;
        gridEndX = gridStartX + cols * cellSize;
      }

      updateBoardLayout();

      const phaseLabels = {
        persiapan: "Persiapan",
        pertahanan: "Pertahanan",
        upgrade: "Peningkatan",
      };

      const sceneTitles = {
        persiapan: "Hidup & Persiapan",
        pertahanan: "Pengepungan",
        upgrade: "Peningkatan Desa",
      };

      const plantDefs = {
        mage: {
          name: "Kipli 3",
          cost: { benih: 1, koin: 12 },
          damage: 7,
          range: 220,
          burstShots: 3,
          burstInterval: 0.2,
          burstDelay: 1.5,
          hp: 48,
          color: "#3a7bd5",
          sprite: "assets/Tumbuhan/Kipli 3.png",
          spriteScale: 0.62,
        },
        slow: {
          name: "Kucing",
          cost: { benih: 1, koin: 10 },
          damage: 2,
          range: 200,
          cooldown: 0.25,
          hp: 52,
          color: "#2a9d8f",
          sprite: "assets/Tumbuhan/Kucing.png",
          spriteScale: 0.62,
        },
        heal: {
          name: "Pemakan",
          cost: { benih: 1, koin: 14 },
          range: 120,
          eatDuration: 3,
          hp: 60,
          color: "#7fb069",
          sprite: "assets/Tumbuhan/Pemakan.png",
          spriteScale: 0.62,
        },
        buff: {
          name: "Perisai",
          cost: { benih: 1, koin: 11 },
          hp: 70,
          shield: 70,
          color: "#4ea8de",
          sprite: "assets/Tumbuhan/Perisai.png",
          spriteScale: 0.62,
        },
      };

      const enemyDefs = {
        orc: { name: "Orc", hp: 42, speed: 26, damage: 14, color: "#6ce0c6" },
        orcRogue: { name: "Orc Rogue", hp: 36, speed: 30, damage: 12, color: "#6aa9e6" },
        orcShaman: { name: "Orc Shaman", hp: 38, speed: 22, damage: 13, color: "#a0c4ff" },
        orcWarrior: { name: "Orc Warrior", hp: 70, speed: 18, damage: 22, color: "#a98467" },
        skeleton: { name: "Skeleton", hp: 40, speed: 24, damage: 14, color: "#cdb4db" },
        skeletonMage: { name: "Skeleton Mage", hp: 34, speed: 20, damage: 15, color: "#d6ccc2" },
        skeletonRogue: { name: "Skeleton Rogue", hp: 36, speed: 28, damage: 12, color: "#a9def9" },
        skeletonWarrior: { name: "Skeleton Warrior", hp: 52, speed: 20, damage: 18, color: "#c7b9a7" },
      };

      const weapons = [
        {
          id: "pedang",
          name: "Pedang",
          type: "melee",
          damage: 10,
          cooldown: 0.45,
          range: 58,
          arc: 1.4,
          icon: "assets/senjata/pedang.png",
          price: 0,
          holdScale: 0.7,
          holdDistance: 16,
          holdOffsetY: 6,
          attackType: "slice",
          effectColor: "#d6f3ff",
          effectWidth: 12,
        },
        {
          id: "pedangPanjang",
          name: "Pedang Panjang",
          type: "melee",
          damage: 12,
          cooldown: 0.55,
          range: 70,
          arc: 1.2,
          icon: "assets/senjata/pedang panjang.png",
          price: 18,
          holdScale: 0.76,
          holdDistance: 18,
          holdOffsetY: 4,
          attackType: "slice",
          effectColor: "#c9e7ff",
          effectWidth: 14,
        },
        {
          id: "kapak",
          name: "Kapak",
          type: "melee",
          damage: 14,
          cooldown: 0.65,
          range: 54,
          arc: 1.2,
          icon: "assets/senjata/kapak.png",
          price: 16,
          holdScale: 0.74,
          holdDistance: 14,
          holdOffsetY: 8,
          attackType: "slice",
          effectColor: "#ffd7b1",
          effectWidth: 16,
        },
        {
          id: "pisau",
          name: "Pisau",
          type: "melee",
          damage: 7,
          cooldown: 0.28,
          range: 42,
          arc: 1.6,
          icon: "assets/senjata/pisau.png",
          price: 8,
          holdScale: 0.6,
          holdDistance: 12,
          holdOffsetY: 6,
          attackType: "slice",
          effectColor: "#e2f3ff",
          effectWidth: 10,
        },
        {
          id: "pecut",
          name: "Pecut",
          type: "melee",
          damage: 9,
          cooldown: 0.48,
          range: 88,
          arc: 0.9,
          icon: "assets/senjata/pecut.png",
          price: 12,
          holdScale: 0.75,
          holdDistance: 18,
          holdOffsetY: 2,
          attackType: "slice",
          effectColor: "#ffe1f5",
          effectWidth: 12,
        },
        {
          id: "tombak",
          name: "Tombak",
          type: "throw",
          damage: 16,
          cooldown: 0.85,
          speed: 560,
          icon: "assets/senjata/tombak.png",
          price: 14,
          holdScale: 0.8,
          holdDistance: 18,
          holdOffsetY: 6,
          projectileSrc: "assets/senjata/tombak.png",
          projectileSize: 26,
          spawnOffset: 20,
          attackType: "pierce",
        },
        {
          id: "panah",
          name: "Busur & Panah",
          type: "bow",
          damage: 10,
          cooldown: 0.55,
          speed: 640,
          icon: "assets/senjata/Busur.png",
          price: 10,
          holdScale: 0.65,
          holdDistance: 14,
          holdOffsetY: 4,
          projectileSrc: "assets/senjata/Busur.png",
          projectileSize: 20,
          spawnOffset: 18,
          projectileHidden: true,
          attackType: "pierce",
        },
      ];

      const armorOptions = [
        { id: "none", name: "Tanpa armor", src: null, price: 0 },
        {
          id: "robe",
          name: "Jubah penyihir",
          src: "assets/armor/armour01magiciansrobe.png",
          price: 18,
        },
        {
          id: "shirt",
          name: "Baju putih",
          src: "assets/armor/armour02whiteshirt.png",
          price: 12,
        },
        {
          id: "velvet",
          name: "Baju beludru",
          src: "assets/armor/armour03velvetoutfit.png",
          price: 16,
        },
        {
          id: "chain",
          name: "Baju rantai",
          src: "assets/armor/armour04chainmail.png",
          price: 26,
        },
        {
          id: "monk",
          name: "Jubah biksu",
          src: "assets/armor/armour05monksrobe.png",
          price: 14,
        },
        {
          id: "plate",
          name: "Baju plat",
          src: "assets/armor/armour05platemail.png",
          price: 32,
        },
        {
          id: "leather",
          name: "Baju kulit",
          src: "assets/armor/armour07leatherjerkin.png",
          price: 20,
        },
      ];
      let selectedArmorIndex = 0;
      let selectedWeaponIndex = 0;

      const coinAssets = [
        {
          id: "koin",
          name: "Koin",
          src: "assets/Mata Uang/Koin.png",
          unitValue: 10000,
        },
        {
          id: "berlian",
          name: "Berlian",
          src: "assets/Mata Uang/Berlian.png",
          unitValue: 10,
        },
        {
          id: "ruby",
          name: "Ruby",
          src: "assets/Mata Uang/Ruby.png",
          unitValue: 1,
        },
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
          unlockLevel: 1,
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
          unlockLevel: 2,
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
          unlockLevel: 3,
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
          unlockLevel: 4,
          weather: { name: "Salju", desc: "Dingin memperlambat musuh", coinsBonus: 0, enemySpeed: -0.08, healBonus: 0.05 },
        },
      ];

      const maxSelectableLevel = 5;

      function getMaxWavesForLevel(level) {
        if (level <= 3) return 3;
        return Math.min(level, maxSelectableLevel);
      }

      const spriteSheets = {
        player: {
          idleDown: { src: "assets/Animations/Idle_Base/Idle_Down-Sheet.png", frames: 4 },
          idleSide: { src: "assets/Animations/Idle_Base/Idle_Side-Sheet.png", frames: 4 },
          idleUp: { src: "assets/Animations/Idle_Base/Idle_Up-Sheet.png", frames: 4 },
          runDown: { src: "assets/Animations/Run_Base/Run_Down-Sheet.png", frames: 6 },
          runSide: { src: "assets/Animations/Run_Base/Run_Side-Sheet.png", frames: 6 },
          runUp: { src: "assets/Animations/Run_Base/Run_Up-Sheet.png", frames: 6 },
          hitDown: { src: "assets/Animations/Hit_Base/Hit_Down-Sheet.png", frames: 4 },
          hitSide: { src: "assets/Animations/Hit_Base/Hit_Side-Sheet.png", frames: 4 },
          hitUp: { src: "assets/Animations/Hit_Base/Hit_Up-Sheet.png", frames: 4 },
          deathDown: { src: "assets/Animations/Death_Base/Death_Down-Sheet.png", frames: 8 },
          deathSide: { src: "assets/Animations/Death_Base/Death_Side-Sheet.png", frames: 8 },
          deathUp: { src: "assets/Animations/Death_Base/Death_Up-Sheet.png", frames: 8 },
          sliceDown: { src: "assets/Animations/Slice_Base/Slice_Down-Sheet.png", frames: 8 },
          sliceSide: { src: "assets/Animations/Slice_Base/Slice_Side-Sheet.png", frames: 8 },
          sliceUp: { src: "assets/Animations/Slice_Base/Slice_Up-Sheet.png", frames: 8 },
          pierceDown: { src: "assets/Animations/Pierce_Base/Pierce_Down-Sheet.png", frames: 8 },
          pierceSide: { src: "assets/Animations/Pierce_Base/Pierce_Side-Sheet.png", frames: 8 },
          pierceUp: { src: "assets/Animations/Pierce_Base/Pierce_Top-Sheet.png", frames: 8 },
          frameW: 64,
          frameH: 64,
        },
        enemies: {
          orc: {
            idle: {
              src: "assets/enemies/Orc Crew/Orc/Idle/Idle-Sheet.png",
              frames: 4,
              frameW: 32,
              frameH: 32,
            },
            run: {
              src: "assets/enemies/Orc Crew/Orc/Run/Run-Sheet.png",
              frames: 6,
              frameW: 64,
              frameH: 64,
            },
            death: {
              src: "assets/enemies/Orc Crew/Orc/Death/Death-Sheet.png",
              frames: 6,
              frameW: 64,
              frameH: 64,
            },
          },
          orcRogue: {
            idle: {
              src: "assets/enemies/Orc Crew/Orc - Rogue/Idle/Idle-Sheet.png",
              frames: 4,
              frameW: 32,
              frameH: 32,
            },
            run: {
              src: "assets/enemies/Orc Crew/Orc - Rogue/Run/Run-Sheet.png",
              frames: 6,
              frameW: 64,
              frameH: 64,
            },
            death: {
              src: "assets/enemies/Orc Crew/Orc - Rogue/Death/Death-Sheet.png",
              frames: 6,
              frameW: 64,
              frameH: 64,
            },
          },
          orcShaman: {
            idle: {
              src: "assets/enemies/Orc Crew/Orc - Shaman/Idle/Idle-Sheet.png",
              frames: 4,
              frameW: 32,
              frameH: 32,
            },
            run: {
              src: "assets/enemies/Orc Crew/Orc - Shaman/Run/Run-Sheet.png",
              frames: 6,
              frameW: 64,
              frameH: 64,
            },
            death: {
              src: "assets/enemies/Orc Crew/Orc - Shaman/Death/Death-Sheet.png",
              frames: 7,
              frameW: 64,
              frameH: 64,
            },
          },
          orcWarrior: {
            idle: {
              src: "assets/enemies/Orc Crew/Orc - Warrior/Idle/Idle-Sheet.png",
              frames: 4,
              frameW: 32,
              frameH: 32,
            },
            run: {
              src: "assets/enemies/Orc Crew/Orc - Warrior/Run/Run-Sheet.png",
              frames: 6,
              frameW: 64,
              frameH: 64,
            },
            death: {
              src: "assets/enemies/Orc Crew/Orc - Warrior/Death/Death-Sheet.png",
              frames: 9,
              frameW: 64,
              frameH: 80,
            },
          },
          skeleton: {
            idle: {
              src: "assets/enemies/Skeleton Crew/Skeleton - Base/Idle/Idle-Sheet.png",
              frames: 4,
              frameW: 32,
              frameH: 32,
            },
            run: {
              src: "assets/enemies/Skeleton Crew/Skeleton - Base/Run/Run-Sheet.png",
              frames: 6,
              frameW: 64,
              frameH: 64,
            },
            death: {
              src: "assets/enemies/Skeleton Crew/Skeleton - Base/Death/Death-Sheet.png",
              frames: 12,
              frameW: 64,
              frameH: 64,
            },
          },
          skeletonMage: {
            idle: {
              src: "assets/enemies/Skeleton Crew/Skeleton - Mage/Idle/Idle-Sheet.png",
              frames: 4,
              frameW: 32,
              frameH: 32,
            },
            run: {
              src: "assets/enemies/Skeleton Crew/Skeleton - Mage/Run/Run-Sheet.png",
              frames: 6,
              frameW: 64,
              frameH: 64,
            },
            death: {
              src: "assets/enemies/Skeleton Crew/Skeleton - Mage/Death/Death-Sheet.png",
              frames: 6,
              frameW: 64,
              frameH: 64,
            },
          },
          skeletonRogue: {
            idle: {
              src: "assets/enemies/Skeleton Crew/Skeleton - Rogue/Idle/Idle-Sheet.png",
              frames: 4,
              frameW: 32,
              frameH: 32,
            },
            run: {
              src: "assets/enemies/Skeleton Crew/Skeleton - Rogue/Run/Run-Sheet.png",
              frames: 6,
              frameW: 64,
              frameH: 64,
            },
            death: {
              src: "assets/enemies/Skeleton Crew/Skeleton - Rogue/Death/Death-Sheet.png",
              frames: 6,
              frameW: 64,
              frameH: 64,
            },
          },
          skeletonWarrior: {
            idle: {
              src: "assets/enemies/Skeleton Crew/Skeleton - Warrior/Idle/Idle-Sheet.png",
              frames: 4,
              frameW: 32,
              frameH: 32,
            },
            run: {
              src: "assets/enemies/Skeleton Crew/Skeleton - Warrior/Run/Run-Sheet.png",
              frames: 6,
              frameW: 64,
              frameH: 64,
            },
            death: {
              src: "assets/enemies/Skeleton Crew/Skeleton - Warrior/Death/Death-Sheet.png",
              frames: 6,
              frameW: 64,
              frameH: 48,
            },
          },
        },
      };

      const spriteImages = {};
      let spritesLoaded = false;
      const playerAnimRates = {
        idle: 6,
        run: 10,
        hit: 12,
        attack: 12,
        death: 10,
      };
      const enemyAnimRates = {
        idle: 4,
        run: 8,
        death: 10,
      };
      const enemyBaseSize = 64;

      function loadSprites() {
        const sources = [];
        Object.values(spriteSheets.player).forEach((item) => {
          if (item && item.src) sources.push(item.src);
        });
        Object.values(spriteSheets.enemies).forEach((enemy) => {
          if (!enemy) return;
          ["idle", "run", "death"].forEach((state) => {
            const sheet = enemy[state];
            if (sheet && sheet.src) sources.push(sheet.src);
          });
        });
        armorOptions.forEach((armor) => {
          if (armor && armor.src) sources.push(armor.src);
        });
        weapons.forEach((weapon) => {
          if (weapon && weapon.icon) sources.push(weapon.icon);
          if (weapon && weapon.projectileSrc) sources.push(weapon.projectileSrc);
        });
        Object.values(plantDefs).forEach((def) => {
          if (def && def.sprite) sources.push(def.sprite);
        });
        coinAssets.forEach((coin) => {
          if (coin && coin.src) sources.push(coin.src);
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
        lootTotals: { koin: 0, berlian: 0, ruby: 0 },
        materials: 4,
        trophies: 0,
        seeds: { mage: 0, slow: 0, heal: 0, buff: 0 },
        core: { hp: 120, maxHp: 120 },
        lives: 3,
        xp: 0,
        level: 1,
        skillPoints: 0,
        skills: { farming: 0, combat: 0 },
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
        armorOwned: { none: true },
        weaponOwned: { pedang: true },
        plants: [],
        enemies: [],
        projectiles: [],
        effects: [],
        waveTimer: 0,
        spawnQueue: [],
        kills: 0,
        paused: false,
        player: {
          x: gridStartX + 20,
          y: boardOffsetY + boardHeight / 2,
          speed: 140,
          weaponIndex: 0,
          cooldown: 0,
          invulnUntil: 0,
          dodgeUntil: 0,
          dodgeCooldownUntil: 0,
          facing: "down",
          moving: false,
          animTime: 0,
          state: "normal",
          stateTime: 0,
          stateDuration: 0,
          attackType: "slice",
          attackAngle: 0,
          armorIndex: selectedArmorIndex,
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

      function formatNumber(value) {
        return Math.round(value).toLocaleString("id-ID");
      }

      function startPlayerState(state, duration, attackType) {
        if (game.player.state === "dead" && state !== "dead") return;
        game.player.state = state;
        game.player.stateTime = 0;
        game.player.stateDuration = duration;
        if (attackType) {
          game.player.attackType = attackType;
        }
      }

      function faceTowards(dx, dy) {
        if (Math.abs(dx) > Math.abs(dy)) {
          game.player.facing = dx < 0 ? "left" : "right";
        } else {
          game.player.facing = dy < 0 ? "up" : "down";
        }
      }

      function getFacingAngle(facing) {
        if (facing === "up") return -Math.PI / 2;
        if (facing === "down") return Math.PI / 2;
        if (facing === "left") return Math.PI;
        return 0;
      }

      function normalizeAngle(angle) {
        let value = angle;
        while (value > Math.PI) value -= Math.PI * 2;
        while (value < -Math.PI) value += Math.PI * 2;
        return value;
      }

      function angleDiff(a, b) {
        return Math.abs(normalizeAngle(a - b));
      }

      function getAttackDuration(attackType) {
        const sprites = spriteSheets.player;
        const sheet = attackType === "pierce" ? sprites.pierceDown : sprites.sliceDown;
        return sheet.frames / playerAnimRates.attack;
      }

      function getEnemySprite(type) {
        return spriteSheets.enemies[type] || null;
      }

      function getEnemySheet(enemy, state) {
        const sprite = getEnemySprite(enemy.type);
        if (!sprite) return null;
        if (state === "death") return sprite.death;
        if (state === "idle") return sprite.idle;
        return sprite.run;
      }

      function startEnemyDeath(enemy) {
        if (enemy.state === "dead") return;
        enemy.state = "dead";
        enemy.stateTime = 0;
        const sheet = getEnemySheet(enemy, "death");
        const frames = sheet ? sheet.frames : 0;
        enemy.deathDuration = frames ? frames / enemyAnimRates.death : 0.6;
      }

      function applyEnemyDamage(enemy, damage) {
        if (enemy.state === "dead" || enemy.state === "eaten") return;
        enemy.hp -= damage;
        if (enemy.hp <= 0) {
          enemy.hp = 0;
          startEnemyDeath(enemy);
        }
      }

      function performMeleeAttack(weapon, angle) {
        const originX = game.player.x;
        const originY = game.player.y;
        const damage =
          weapon.damage * (1 + game.bonuses.playerDamage + game.skills.combat * 0.03);
        const range = weapon.range;
        const arc = weapon.arc;
        game.enemies.forEach((enemy) => {
          if (enemy.state === "dead") return;
          const dx = enemy.x - originX;
          const dy = enemy.y - originY;
          const dist = Math.hypot(dx, dy);
          if (dist > range) return;
          const dir = Math.atan2(dy, dx);
          if (angleDiff(dir, angle) > arc / 2) return;
          applyEnemyDamage(enemy, damage);
        });
        game.effects.push({
          type: "slash",
          x: originX,
          y: originY,
          angle,
          radius: range,
          arc,
          width: weapon.effectWidth || 12,
          color: weapon.effectColor || "#d6f3ff",
          ttl: 0.2,
          life: 0.2,
        });
      }

      function spawnProjectile(weapon, angle) {
        const offset = weapon.spawnOffset || weapon.holdDistance || 14;
        const originX = game.player.x + Math.cos(angle) * offset;
        const originY = game.player.y + Math.sin(angle) * offset;
        const vx = Math.cos(angle) * weapon.speed;
        const vy = Math.sin(angle) * weapon.speed;
        const damage =
          weapon.damage * (1 + game.bonuses.playerDamage + game.skills.combat * 0.03);
        game.projectiles.push({
          x: originX,
          y: originY,
          vx,
          vy,
          damage,
          radius: Math.max(8, Math.round((weapon.projectileSize || 18) * 0.45)),
          spriteSrc: weapon.projectileSrc || weapon.icon,
          size: weapon.projectileSize || 18,
          hidden: Boolean(weapon.projectileHidden),
          rotation: angle,
          hit: false,
        });
      }

      function getWeaponDrawAngle(player, weapon) {
        const baseAngle = Number.isFinite(player.attackAngle)
          ? player.attackAngle
          : getFacingAngle(player.facing);
        if (player.state === "attack") {
          if (weapon.type === "melee") {
            const progress =
              player.stateDuration > 0
                ? clamp(player.stateTime / player.stateDuration, 0, 1)
                : 0;
            const swing = (progress - 0.5) * (weapon.arc || 1.2);
            return baseAngle + swing;
          }
          return baseAngle;
        }
        return getFacingAngle(player.facing);
      }

      function drawHeldWeapon(player) {
        if (player.state === "dead") return;
        const weapon = weapons[player.weaponIndex];
        if (!weapon || !weapon.icon) return;
        const img = getSpriteImage(weapon.icon);
        if (!img) return;
        const angle = getWeaponDrawAngle(player, weapon);
        const distance = weapon.holdDistance || 14;
        const offsetY = weapon.holdOffsetY || 0;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance + offsetY;
        const baseSize = img.width || 32;
        const size = Math.round(baseSize * (weapon.holdScale || 0.7));

        ctx.save();
        ctx.translate(Math.round(player.x + dx), Math.round(player.y + dy));
        ctx.rotate(angle);
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
        ctx.restore();
      }

      function updateArmorUI() {
        if (!ui.armorName) return;
        const armor = armorOptions[selectedArmorIndex];
        ui.armorName.textContent = armor ? armor.name : "Armor";
        if (ui.armorPrice) {
          if (armor && armor.price > 0) {
            ui.armorPrice.textContent = `Harga: ${armor.price} koin`;
          } else {
            ui.armorPrice.textContent = "Harga: Gratis";
          }
        }
        if (ui.armorPreview) {
          if (armor && armor.src) {
            ui.armorPreview.src = armor.src;
            ui.armorPreview.alt = armor.name;
            ui.armorPreview.style.opacity = "1";
          } else {
            ui.armorPreview.removeAttribute("src");
            ui.armorPreview.alt = "Tanpa armor";
            ui.armorPreview.style.opacity = "0";
          }
        }

        if (ui.armorAction && armor) {
          const owned = Boolean(game.armorOwned[armor.id]);
          const equipped = game.player && game.player.armorIndex === selectedArmorIndex;
          if (!owned) {
            ui.armorAction.textContent = "Beli";
            ui.armorAction.disabled = game.coins < armor.price;
          } else if (equipped) {
            ui.armorAction.textContent = "Terpasang";
            ui.armorAction.disabled = true;
          } else {
            ui.armorAction.textContent = "Pakai";
            ui.armorAction.disabled = false;
          }
        }
      }

      function getFirstOwnedWeaponIndex() {
        for (let i = 0; i < weapons.length; i += 1) {
          const weapon = weapons[i];
          if (weapon && game.weaponOwned[weapon.id]) return i;
        }
        return 0;
      }

      function ensureEquippedWeaponOwned() {
        if (!game.player) return;
        const current = weapons[game.player.weaponIndex];
        if (!current || !game.weaponOwned[current.id]) {
          game.player.weaponIndex = getFirstOwnedWeaponIndex();
        }
      }

      function updateWeaponUI() {
        if (!ui.weaponName) return;
        const weapon = weapons[selectedWeaponIndex];
        ui.weaponName.textContent = weapon ? weapon.name : "Senjata";
        if (ui.weaponPrice) {
          if (weapon) {
            const price = weapon.price || 0;
            ui.weaponPrice.textContent =
              price > 0 ? `Harga: ${price} koin` : "Harga: Gratis";
          } else {
            ui.weaponPrice.textContent = "Harga: -";
          }
        }
        if (ui.weaponPreview) {
          if (weapon && weapon.icon) {
            ui.weaponPreview.src = weapon.icon;
            ui.weaponPreview.alt = weapon.name;
            ui.weaponPreview.style.opacity = "1";
          } else {
            ui.weaponPreview.removeAttribute("src");
            ui.weaponPreview.alt = "Senjata";
            ui.weaponPreview.style.opacity = "0";
          }
        }
        if (ui.weaponAction && weapon) {
          const owned = Boolean(game.weaponOwned[weapon.id]);
          const equipped =
            weapons[game.player.weaponIndex] &&
            weapons[game.player.weaponIndex].id === weapon.id;
          if (!owned) {
            ui.weaponAction.textContent = "Beli";
            ui.weaponAction.disabled = game.coins < (weapon.price || 0);
          } else if (equipped) {
            ui.weaponAction.textContent = "Terpasang";
            ui.weaponAction.disabled = true;
          } else {
            ui.weaponAction.textContent = "Pakai";
            ui.weaponAction.disabled = false;
          }
        }
      }

      function updateShopOverlay() {
        if (!shopUi) return;
        const armor = armorOptions[selectedArmorIndex];
        if (shopUi.armorName) {
          shopUi.armorName.textContent = armor ? armor.name : "Armor";
        }
        if (shopUi.armorPrice) {
          if (armor && armor.price > 0) {
            shopUi.armorPrice.textContent = `Harga: ${armor.price} koin`;
          } else {
            shopUi.armorPrice.textContent = "Harga: Gratis";
          }
        }
        if (shopUi.armorPreview) {
          if (armor && armor.src) {
            shopUi.armorPreview.src = armor.src;
            shopUi.armorPreview.alt = armor.name;
            shopUi.armorPreview.style.opacity = "1";
          } else {
            shopUi.armorPreview.removeAttribute("src");
            shopUi.armorPreview.alt = "Tanpa armor";
            shopUi.armorPreview.style.opacity = "0";
          }
        }
        if (shopUi.armorAction && armor) {
          const owned = Boolean(game.armorOwned[armor.id]);
          const equipped = game.player && game.player.armorIndex === selectedArmorIndex;
          if (!owned) {
            shopUi.armorAction.textContent = "Beli";
            shopUi.armorAction.disabled = game.coins < armor.price;
          } else if (equipped) {
            shopUi.armorAction.textContent = "Terpasang";
            shopUi.armorAction.disabled = true;
          } else {
            shopUi.armorAction.textContent = "Pakai";
            shopUi.armorAction.disabled = false;
          }
        }

        const weapon = weapons[selectedWeaponIndex];
        if (shopUi.weaponName) {
          shopUi.weaponName.textContent = weapon ? weapon.name : "Senjata";
        }
        if (shopUi.weaponPrice) {
          if (weapon) {
            const price = weapon.price || 0;
            shopUi.weaponPrice.textContent =
              price > 0 ? `Harga: ${price} koin` : "Harga: Gratis";
          } else {
            shopUi.weaponPrice.textContent = "Harga: -";
          }
        }
        if (shopUi.weaponPreview) {
          if (weapon && weapon.icon) {
            shopUi.weaponPreview.src = weapon.icon;
            shopUi.weaponPreview.alt = weapon.name;
            shopUi.weaponPreview.style.opacity = "1";
          } else {
            shopUi.weaponPreview.removeAttribute("src");
            shopUi.weaponPreview.alt = "Senjata";
            shopUi.weaponPreview.style.opacity = "0";
          }
        }
        if (shopUi.weaponAction && weapon) {
          const owned = Boolean(game.weaponOwned[weapon.id]);
          const equipped =
            weapons[game.player.weaponIndex] &&
            weapons[game.player.weaponIndex].id === weapon.id;
          if (!owned) {
            shopUi.weaponAction.textContent = "Beli";
            shopUi.weaponAction.disabled = game.coins < (weapon.price || 0);
          } else if (equipped) {
            shopUi.weaponAction.textContent = "Terpasang";
            shopUi.weaponAction.disabled = true;
          } else {
            shopUi.weaponAction.textContent = "Pakai";
            shopUi.weaponAction.disabled = false;
          }
        }
      }

      function setWeaponIndex(index) {
        const total = weapons.length;
        if (!total) return;
        const next = ((index % total) + total) % total;
        selectedWeaponIndex = next;
        updateWeaponUI();
        updateShopOverlay();
      }

      function selectPlant(type) {
        if (!plantDefs[type]) return;
        selectedPlant = type;
        renderPlantList();
        updateSeedBar();
      }

      function updateSeedBar() {
        if (!seedSlots.length) return;
        if (ui.seedBarTitle) {
          if (game.phase === "persiapan") {
            ui.seedBarTitle.textContent = "Tas";
          } else if (game.phase === "pertahanan") {
            ui.seedBarTitle.textContent = "Tas (Pertahanan)";
          } else {
            ui.seedBarTitle.textContent = "Tas (Peningkatan)";
          }
        }
        seedSlots.forEach((slot) => {
          const key = slot.dataset.seed;
          if (!key) return;
          const count = game.seeds[key] ?? 0;
          const countEl = slot.querySelector(".seed-count");
          if (countEl) countEl.textContent = count;
          slot.classList.toggle("active", selectedPlant === key);
          slot.classList.toggle("empty", count <= 0);
        });
      }

      function renderCoinMenu() {
        if (!ui.coinMenu) return;
        ui.coinMenu.innerHTML = "";
        coinAssets.forEach((coin) => {
          const totalCount = game.lootTotals ? game.lootTotals[coin.id] || 0 : 0;
          const totalValue = totalCount * (coin.unitValue || 0);
          const info = `Total: ${formatNumber(totalValue)}`;
          const item = document.createElement("div");
          item.className = "coin-item";
          item.innerHTML = `
            <img src="${coin.src}" alt="${coin.name}" />
            <div>
              <div class="coin-name">${coin.name}</div>
              <div class="coin-asset">${info}</div>
            </div>
          `;
          ui.coinMenu.appendChild(item);
        });
      }

      function toggleCoinMenu(force) {
        if (!ui.coinMenu || !ui.coinSlot) return;
        const shouldShow = typeof force === "boolean"
          ? force
          : !ui.coinMenu.classList.contains("show");
        if (shouldShow) {
          renderCoinMenu();
        }
        ui.coinMenu.classList.toggle("show", shouldShow);
        ui.coinSlot.setAttribute("aria-expanded", shouldShow ? "true" : "false");
      }

      function setPauseButtonExpanded(isExpanded) {
        if (!ui.pauseButton) return;
        ui.pauseButton.setAttribute("aria-expanded", isExpanded ? "true" : "false");
      }

      function setMiniMapButtonExpanded(isExpanded) {
        if (!ui.miniMapButton) return;
        ui.miniMapButton.setAttribute("aria-expanded", isExpanded ? "true" : "false");
      }

      function toggleInventoryPanel(force) {
        if (!ui.tasPanel || !ui.inventoryToggle) return;
        const shouldShow = typeof force === "boolean"
          ? force
          : !ui.tasPanel.classList.contains("show");
        ui.tasPanel.classList.toggle("show", shouldShow);
        ui.tasPanel.setAttribute("aria-hidden", shouldShow ? "false" : "true");
        ui.inventoryToggle.setAttribute("aria-expanded", shouldShow ? "true" : "false");
        if (!shouldShow) {
          toggleCoinMenu(false);
        }
      }

      function getNextOwnedWeaponIndex(startIndex, dir) {
        const total = weapons.length;
        if (!total) return 0;
        for (let step = 1; step <= total; step += 1) {
          const idx = (startIndex + dir * step + total) % total;
          const weapon = weapons[idx];
          if (weapon && game.weaponOwned[weapon.id]) return idx;
        }
        return startIndex;
      }

      function equipWeapon(index) {
        const weapon = weapons[index];
        if (!weapon || !game.weaponOwned[weapon.id]) return;
        if (game.player) {
          game.player.weaponIndex = index;
        }
        selectedWeaponIndex = index;
        log(`Senjata ${weapon.name} dipakai.`);
        updateUI();
      }

      function buyWeapon(index) {
        const weapon = weapons[index];
        if (!weapon || game.weaponOwned[weapon.id]) return;
        const price = weapon.price || 0;
        if (game.coins < price) {
          log("Koin tidak cukup untuk membeli senjata.");
          return;
        }
        game.coins -= price;
        game.weaponOwned[weapon.id] = true;
        log(`Senjata ${weapon.name} dibeli.`);
        equipWeapon(index);
        updateUI();
      }

      function setArmorIndex(index) {
        const total = armorOptions.length;
        if (!total) return;
        const next = ((index % total) + total) % total;
        selectedArmorIndex = next;
        updateArmorUI();
        updateShopOverlay();
      }

      function equipArmor(index) {
        const armor = armorOptions[index];
        if (!armor || !game.armorOwned[armor.id]) return;
        if (game.player) {
          game.player.armorIndex = index;
        }
        updateArmorUI();
      }

      function buyArmor(index) {
        const armor = armorOptions[index];
        if (!armor || game.armorOwned[armor.id]) return;
        if (game.coins < armor.price) {
          log("Koin tidak cukup untuk membeli armor.");
          return;
        }
        game.coins -= armor.price;
        game.armorOwned[armor.id] = true;
        log(`Armor ${armor.name} dibeli.`);
        equipArmor(index);
        updateUI();
      }

      function getCoreMarkerPosition() {
        return {
          x: canvas.width * coreMarker.x,
          y: canvas.height * coreMarker.y,
        };
      }

      function getCoreHitY() {
        return getCoreMarkerPosition().y + 12;
      }

      function syncSelectionToPlayer() {
        if (game.phase !== "persiapan") return;
        const cell = getCellAt(game.player.x, game.player.y);
        if (cell) {
          selectedCell = cell;
        }
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
          y: boardOffsetY + row * cellSize + cellSize / 2,
        };
      }

      function getCellAt(x, y) {
        if (x < gridStartX || x >= gridEndX) return null;
        const col = Math.floor((x - gridStartX) / cellSize);
        const localY = y - boardOffsetY;
        if (localY < 0 || localY >= boardHeight) return null;
        const row = Math.floor(localY / cellSize);
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

      function setupSettingsControls() {
        if (ui.mapSelect) {
          ui.mapSelect.innerHTML = "";
          mapSequence.forEach((map, index) => {
            const option = document.createElement("option");
            option.value = String(index);
            option.textContent = map.label;
            ui.mapSelect.appendChild(option);
          });
        }
        if (ui.levelSelect) {
          ui.levelSelect.innerHTML = "";
          for (let level = 1; level <= maxSelectableLevel; level += 1) {
            const option = document.createElement("option");
            option.value = String(level);
            option.textContent = String(level);
            ui.levelSelect.appendChild(option);
          }
        }
        syncSettingsControls();
      }

      function syncSettingsControls() {
        const disableSelects = game.phase === "pertahanan";
        if (ui.mapSelect) {
          ui.mapSelect.value = String(game.mapIndex);
          ui.mapSelect.disabled = disableSelects;
          ui.mapSelect.querySelectorAll("option").forEach((option, index) => {
            const unlockLevel = mapSequence[index]?.unlockLevel || 1;
            option.disabled = game.level < unlockLevel;
          });
        }
        if (ui.levelSelect) {
          ui.levelSelect.value = String(game.level);
          ui.levelSelect.disabled = disableSelects;
        }
        if (ui.startDefenseAlt) {
          ui.startDefenseAlt.disabled = game.phase !== "persiapan";
        }
      }

      function setMapIndex(nextIndex) {
        if (game.phase === "pertahanan") {
          log("Ganti peta hanya saat bukan pertahanan.");
          return false;
        }
        const safeIndex = clamp(nextIndex, 0, mapSequence.length - 1);
        const unlockLevel = mapSequence[safeIndex]?.unlockLevel || 1;
        if (game.level < unlockLevel) {
          log(`Peta terkunci. Capai level ${unlockLevel} untuk membuka.`);
          return false;
        }
        if (safeIndex === game.mapIndex) return true;
        game.mapIndex = safeIndex;
        applyMapTheme();
        updateUI();
        return true;
      }

      function setLevel(nextLevel) {
        if (game.phase === "pertahanan") {
          log("Level hanya bisa diubah saat bukan pertahanan.");
          return false;
        }
        const safeLevel = clamp(nextLevel, 1, maxSelectableLevel);
        if (safeLevel === game.level) return true;
        const spent = game.skills.farming + game.skills.combat;
        game.level = safeLevel;
        game.xp = 0;
        game.skillPoints = Math.max(0, safeLevel - 1 - spent);
        const maxWaves = getMaxWavesForLevel(game.level);
        if (game.waveInMap > maxWaves) {
          game.waveInMap = maxWaves;
        }
        const currentUnlock = mapSequence[game.mapIndex]?.unlockLevel || 1;
        if (game.level < currentUnlock) {
          game.mapIndex = 0;
          applyMapTheme();
        }
        updateUI();
        return true;
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

        const shield = def.shield || 0;
        game.plants.push({
          row,
          col,
          type: selectedPlant,
          hp: def.hp,
          maxHp: def.hp,
          shield,
          maxShield: shield,
          cooldown: 0,
          burstCount: 0,
          eatingTarget: null,
          eatingUntil: 0,
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
        if (!hasStarted) {
          startGame();
        }
        if (game.phase !== "persiapan") return;
        game.phase = "pertahanan";
        const maxWaves = getMaxWavesForLevel(game.level);
        if (game.waveInMap > maxWaves) {
          game.waveInMap = maxWaves;
        }
        game.waveTimer = 0;
        game.spawnQueue = createWave(game.waveInMap);
        game.kills = 0;
        game.lives = 3;
        game.player.x = gridStartX + 20;
        game.player.y = boardOffsetY + boardHeight / 2;
        game.player.state = "normal";
        game.player.stateTime = 0;
        game.player.stateDuration = 0;
        log(
          `Gelombang ${game.waveInMap} dimulai di peta ${mapSequence[game.mapIndex].label}.`
        );
        updateUI();
      }

      function createWave(wave) {
        const level = game.level;
        const difficultyScore = wave + level;
        const difficulty =
          difficultyScore >= 8 ? "sulit" : difficultyScore >= 6 ? "normal" : "mudah";
        const levelScale = 1 + (level - 1) * 0.18;
        const waveScale = 1 + (wave - 1) * 0.08;
        let total = Math.round((8 + wave * 2) * levelScale * waveScale);
        let timeGap = Math.max(0.55, 1.15 - (level - 1) * 0.06 - (wave - 1) * 0.03);
        let pool = [
          { type: "orc", weight: 0.3 },
          { type: "skeleton", weight: 0.3 },
          { type: "orcRogue", weight: 0.2 },
          { type: "skeletonRogue", weight: 0.2 },
        ];
        if (difficulty === "normal") {
          total = Math.round(12 * levelScale * waveScale);
          timeGap = Math.max(0.5, 1.0 - (level - 1) * 0.06 - (wave - 1) * 0.03);
          pool = [
            { type: "orc", weight: 0.2 },
            { type: "skeleton", weight: 0.2 },
            { type: "orcRogue", weight: 0.2 },
            { type: "skeletonRogue", weight: 0.15 },
            { type: "orcShaman", weight: 0.15 },
            { type: "skeletonMage", weight: 0.1 },
          ];
        } else if (difficulty === "sulit") {
          total = Math.round(15 * levelScale * waveScale);
          timeGap = Math.max(0.45, 0.9 - (level - 1) * 0.05 - (wave - 1) * 0.03);
          pool = [
            { type: "orc", weight: 0.15 },
            { type: "skeleton", weight: 0.15 },
            { type: "orcShaman", weight: 0.15 },
            { type: "skeletonMage", weight: 0.15 },
            { type: "orcWarrior", weight: 0.2 },
            { type: "skeletonWarrior", weight: 0.2 },
          ];
        }
        total = Math.max(6, total);

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
          queue.push({ time, col: randRange(0, cols - 1), type });
        }
        return queue.sort((a, b) => a.time - b.time);
      }

      function endDefense() {
        if (game.phase !== "pertahanan") return;
        game.phase = "upgrade";
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
        log("Pertahanan sukses. Waktunya peningkatan.");
        if (game.waveInMap >= getMaxWavesForLevel(game.level)) {
          log("Gelombang terakhir di peta ini selesai. Lanjutkan ke peta berikutnya.");
        }
        updateUI();
      }

      function gainXp(amount) {
        game.xp += amount;
        const threshold = game.level * 18;
        if (game.xp >= threshold) {
          if (game.level < maxSelectableLevel) {
            game.xp -= threshold;
            game.level = Math.min(maxSelectableLevel, game.level + 1);
            game.skillPoints += 1;
            log("Level naik! Kamu mendapat 1 poin kemampuan.");
          } else {
            game.xp = threshold;
          }
        }
      }

      function openUpgradePhase() {
        if (game.phase === "pertahanan") return;
        game.phase = "upgrade";
        log("Masuk fase peningkatan dan bertani.");
        updateUI();
      }

      function canAdvanceToNextWave() {
        return game.phase === "upgrade";
      }

      function nextDay() {
        if (!canAdvanceToNextWave()) return;
        const completedMap = game.waveInMap >= getMaxWavesForLevel(game.level);
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

      function showOverlay(title, bodyHtml, actions, context = "generic") {
        overlayContext = context;
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
        shopUi = null;
        overlayContext = "none";
        setPauseButtonExpanded(false);
        setMiniMapButtonExpanded(false);
        if (ui.shopSlot) {
          ui.shopSlot.setAttribute("aria-expanded", "false");
        }
        game.paused = !hasStarted;
      }

      function buildLevelWaveTemplate() {
        const rows = [];
        for (let level = 1; level <= maxSelectableLevel; level += 1) {
          const maxWave = getMaxWavesForLevel(level);
          const waves = [];
          for (let wave = 1; wave <= maxWave; wave += 1) {
            waves.push(wave);
          }
          rows.push(`<div class="map-level-row">Level ${level}: Wave ${waves.join(" ")}</div>`);
        }
        return rows.join("");
      }

      function openMiniMap() {
        if (ui.overlay.classList.contains("show") && overlayContext === "minimap") {
          hideOverlay();
          return;
        }
        toggleInventoryPanel(false);
        const body = `
          <div class="map-browser">
            <div class="map-grid">
              ${mapSequence.map((map, index) => {
                const unlockLevel = map.unlockLevel || 1;
                const locked = game.level < unlockLevel;
                const selected = game.mapIndex === index;
                return `
                  <button
                    class="map-card${locked ? " locked" : ""}${selected ? " selected" : ""}"
                    data-map-index="${index}"
                    type="button"
                    aria-disabled="${locked ? "true" : "false"}"
                  >
                    <div class="map-thumb">
                      <img src="${map.background}" alt="Peta ${map.label}" loading="lazy" />
                      ${locked ? `
                        <div class="map-lock">
                          <div class="lock-icon"></div>
                          <div class="lock-text">Terkunci</div>
                        </div>
                      ` : ""}
                    </div>
                    <div class="map-label">${map.label}</div>
                  </button>
                `;
              }).join("")}
            </div>
            <div class="map-info" id="mapInfo"></div>
          </div>
        `;
        showOverlay(
          "Peta Dunia",
          body,
          [{ label: "Tutup", className: "secondary", onClick: hideOverlay }],
          "minimap"
        );
        setMiniMapButtonExpanded(true);
        setPauseButtonExpanded(false);

        const infoEl = ui.overlayBody.querySelector("#mapInfo");
        const mapButtons = Array.from(ui.overlayBody.querySelectorAll(".map-card"));
        const templateHtml = buildLevelWaveTemplate();
        const renderInfo = (mapIndex) => {
          const map = mapSequence[mapIndex];
          if (!map || !infoEl) return;
          const unlockLevel = map.unlockLevel || 1;
          const locked = game.level < unlockLevel;
          infoEl.innerHTML = `
            <div class="map-info-title">${map.label}</div>
            <div class="map-info-sub">${map.weather.desc}</div>
            ${locked ? `<div class="map-info-lock">Terkunci: butuh level ${unlockLevel}.</div>` : ""}
            <div class="map-level-list">${templateHtml}</div>
          `;
        };

        renderInfo(game.mapIndex);
        mapButtons.forEach((button) => {
          button.addEventListener("click", () => {
            const index = Number.parseInt(button.dataset.mapIndex, 10);
            renderInfo(index);
            if (Number.isNaN(index)) return;
            const map = mapSequence[index];
            const unlockLevel = map?.unlockLevel || 1;
            if (game.level < unlockLevel) {
              log(`Peta terkunci. Capai level ${unlockLevel} untuk membuka.`);
              return;
            }
            if (setMapIndex(index)) {
              mapButtons.forEach((item) => {
                item.classList.toggle(
                  "selected",
                  Number.parseInt(item.dataset.mapIndex, 10) === game.mapIndex
                );
              });
            }
          });
        });
      }

      function openPauseMenu() {
        if (ui.overlay.classList.contains("show") && overlayContext === "pause") {
          hideOverlay();
          return;
        }
        toggleInventoryPanel(false);
        setMiniMapButtonExpanded(false);
        const body = `
          <div class="panel-section">
            <h2>Menu Jeda</h2>
            <p>Game dijeda. Lanjutkan, atur pengaturan, atau kembali ke menu.</p>
          </div>
        `;
        showOverlay(
          "Menu Jeda",
          body,
          [
            { label: "Resume", onClick: hideOverlay },
            { label: "Pengaturan", className: "secondary", onClick: openSettingsMenu },
            { label: "Tutorial", className: "secondary", onClick: openTutorial },
            { label: "Ulang Game", className: "secondary", onClick: () => {
              hideOverlay();
              resetGame();
            } },
            { label: "Keluar ke Menu", className: "danger", onClick: () => {
              hideOverlay();
              hasStarted = false;
              resetGame();
            } },
          ],
          "pause"
        );
        setPauseButtonExpanded(true);
      }

      function openSettingsMenu() {
        const body = `
          <div class="panel-section">
            <h2>Pengaturan</h2>
            <div class="option-grid">
              <div class="option-row">
                <label for="menuLevelSelect">Level Awal</label>
                <select id="menuLevelSelect"></select>
              </div>
              <div class="option-row">
                <label for="menuMapSelect">Pilih Peta</label>
                <select id="menuMapSelect"></select>
              </div>
            </div>
          </div>
        `;
        showOverlay(
          "Pengaturan",
          body,
          [
            { label: "Kembali", className: "secondary", onClick: openPauseMenu },
            { label: "Tutup", className: "secondary", onClick: hideOverlay },
          ],
          "settings"
        );
        setPauseButtonExpanded(true);
        setMiniMapButtonExpanded(false);

        const disableSelects = game.phase === "pertahanan";
        const menuMapSelect = document.getElementById("menuMapSelect");
        if (menuMapSelect) {
          menuMapSelect.innerHTML = "";
          mapSequence.forEach((map, index) => {
            const option = document.createElement("option");
            option.value = String(index);
            option.textContent = map.label;
            option.disabled = game.level < (map.unlockLevel || 1);
            menuMapSelect.appendChild(option);
          });
          menuMapSelect.value = String(game.mapIndex);
          menuMapSelect.disabled = disableSelects;
          menuMapSelect.addEventListener("change", () => {
            const nextIndex = Number.parseInt(menuMapSelect.value, 10);
            if (Number.isNaN(nextIndex)) return;
            if (!setMapIndex(nextIndex)) {
              menuMapSelect.value = String(game.mapIndex);
            }
          });
        }

        const menuLevelSelect = document.getElementById("menuLevelSelect");
        if (menuLevelSelect) {
          menuLevelSelect.innerHTML = "";
          for (let level = 1; level <= maxSelectableLevel; level += 1) {
            const option = document.createElement("option");
            option.value = String(level);
            option.textContent = String(level);
            menuLevelSelect.appendChild(option);
          }
          menuLevelSelect.value = String(game.level);
          menuLevelSelect.disabled = disableSelects;
          menuLevelSelect.addEventListener("change", () => {
            const nextLevel = Number.parseInt(menuLevelSelect.value, 10);
            if (Number.isNaN(nextLevel)) return;
            if (!setLevel(nextLevel)) {
              menuLevelSelect.value = String(game.level);
            }
          });
        }
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
            selectPlant(type);
          });
          ui.plantList.appendChild(button);
        });
      }

      function updateUI() {
        ensureEquippedWeaponOwned();
        ui.waveValue.textContent = `${game.waveInMap}/${getMaxWavesForLevel(game.level)}`;
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
        ui.toUpgrade.disabled = game.phase === "pertahanan" || game.phase === "upgrade";
        const canAdvance = canAdvanceToNextWave();
        ui.nextDay.disabled = !canAdvance;
        ui.nextDay.classList.toggle("hidden", !canAdvance);
        ui.upgradePanel.classList.toggle("hidden", game.phase !== "upgrade");

        if (game.phase === "persiapan") {
          ui.phaseDesc.textContent =
            "Siapkan tanaman dan formasi sebelum gelombang musuh datang.";
        } else if (game.phase === "pertahanan") {
          ui.phaseDesc.textContent = "Pertahankan Inti Desa dari serangan monster.";
        } else if (game.phase === "upgrade") {
          ui.phaseDesc.textContent = "Tingkatkan desa, senjata, dan tanaman.";
        }

        updateArmorUI();
        updateWeaponUI();
        updateShopOverlay();
        renderPlantList();
        updateSeedBar();
        renderCoinMenu();
        syncSettingsControls();
      }

      function findEnemyInRange(plant) {
        const def = plantDefs[plant.type];
        const center = cellCenter(plant.row, plant.col);
        let target = null;
        let closest = Infinity;
        game.enemies.forEach((enemy) => {
          if (enemy.state === "dead" || enemy.state === "eaten") return;
          if (enemy.col !== plant.col) return;
          const dist = Math.abs(enemy.y - center.y);
          if (dist <= def.range && dist < closest) {
            closest = dist;
            target = enemy;
          }
        });
        return target;
      }

      function startPlantEating(plant, enemy, now, duration) {
        plant.eatingTarget = enemy;
        plant.eatingUntil = now + duration;
        enemy.state = "eaten";
        enemy.eatenBy = plant;
        enemy.eatenUntil = plant.eatingUntil;
        enemy.moving = false;
        enemy.attackCooldown = enemy.attackRate;
      }

      function updatePlants(dt) {
        const now = performance.now() / 1000;
        game.plants.forEach((plant) => {
          const def = plantDefs[plant.type];
          if (!def) return;
          plant.cooldown = Math.max(plant.cooldown - dt, 0);

          if (plant.type === "heal") {
            const target = plant.eatingTarget;
            if (target) {
              if (target.state !== "eaten") {
                plant.eatingTarget = null;
                return;
              }
              if (now >= plant.eatingUntil) {
                target.hp = 0;
                startEnemyDeath(target);
                plant.eatingTarget = null;
              }
              return;
            }
            const enemy = findEnemyInRange(plant);
            if (!enemy) return;
            startPlantEating(plant, enemy, now, def.eatDuration || 3);
            return;
          }

          if (plant.type === "buff") return;

          if (plant.cooldown > 0) return;
          const enemy = findEnemyInRange(plant);
          if (!enemy) {
            if (plant.type === "mage") {
              plant.burstCount = 0;
            }
            return;
          }
          const damage = def.damage * (1 + game.bonuses.plantDamage);
          applyEnemyDamage(enemy, damage);
          const center = cellCenter(plant.row, plant.col);
          const effect = {
            x1: center.x,
            y1: center.y,
            x2: enemy.x,
            y2: enemy.y,
            ttl: 0.15,
            life: 0.15,
            color: def.color,
          };
          if (plant.type === "slow") {
            effect.ttl = 0.08;
            effect.life = 0.08;
            effect.dash = [4, 6];
            effect.width = 2;
          } else if (plant.type === "mage") {
            effect.ttl = 0.12;
            effect.life = 0.12;
            effect.segmented = true;
            effect.segmentCount = 3;
            effect.segmentLength = 12;
            effect.width = 3;
          }
          game.effects.push(effect);

          if (plant.type === "mage") {
            const burstTotal = def.burstShots || 1;
            const burstInterval = def.burstInterval ?? def.cooldown ?? 0;
            const burstDelay = def.burstDelay || 0;
            plant.burstCount = (plant.burstCount || 0) + 1;
            if (plant.burstCount >= burstTotal) {
              plant.burstCount = 0;
              plant.cooldown = burstDelay;
            } else {
              plant.cooldown = burstInterval;
            }
            return;
          }

          plant.cooldown = def.cooldown || 0;
        });
      }

      function findBlockingPlant(enemy) {
        const maxColOffset = game.level >= 5 ? 2 : game.level >= 3 ? 1 : 0;
        let target = null;
        let targetY = -Infinity;
        game.plants.forEach((plant) => {
          if (Math.abs(plant.col - enemy.col) > maxColOffset) return;
          const center = cellCenter(plant.row, plant.col);
          if (center.y < enemy.y && center.y > targetY) {
            target = plant;
            targetY = center.y;
          }
        });
        if (!target) return null;
        if (enemy.y - targetY <= cellSize * 0.25) {
          return target;
        }
        return null;
      }

      function applyPlantDamage(plant, damage) {
        let remaining = damage;
        if (plant.shield && plant.shield > 0) {
          const shieldDamage = Math.min(plant.shield, remaining);
          plant.shield = Math.max(0, plant.shield - shieldDamage);
          remaining -= shieldDamage;
        }
        if (remaining > 0) {
          plant.hp = Math.max(0, plant.hp - remaining);
        }
        return plant.hp <= 0;
      }

      function updateEnemies(dt) {
        const now = performance.now() / 1000;
        const player = game.player;
        game.enemies.forEach((enemy) => {
          if (enemy.state === "dead") {
            enemy.stateTime += dt;
            return;
          }
          if (enemy.state === "eaten") {
            const eater = enemy.eatenBy;
            const eaterAlive = eater && game.plants.includes(eater);
            if (!eaterAlive) {
              enemy.state = "run";
              enemy.eatenBy = null;
              enemy.eatenUntil = 0;
              enemy.attackCooldown = enemy.attackRate;
              return;
            }
            const center = cellCenter(eater.row, eater.col);
            enemy.x = center.x;
            enemy.y = center.y;
            enemy.moving = false;
            if (now >= enemy.eatenUntil) {
              enemy.hp = 0;
              startEnemyDeath(enemy);
            }
            return;
          }
          const targetPlant = findBlockingPlant(enemy);
          if (targetPlant) {
            enemy.moving = false;
            enemy.attackCooldown -= dt;
            if (enemy.attackCooldown <= 0) {
              const destroyed = applyPlantDamage(targetPlant, enemy.damage);
              enemy.attackCooldown = enemy.attackRate;
              if (destroyed) {
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
          enemy.moving = true;
          enemy.y -= speed * dt;

          const dx = enemy.x - player.x;
          const dy = enemy.y - player.y;
          if (dx * dx + dy * dy < 220 && now > player.invulnUntil) {
            const damage = Math.max(6, enemy.damage * 0.6);
            player.hp -= damage;
            log("Petani terkena serangan.");
            if (player.hp <= 0) {
              game.lives -= 1;
              game.lives = Math.max(0, game.lives);
              player.hp = player.maxHp;
              const deathDuration =
                spriteSheets.player.deathDown.frames / playerAnimRates.death;
              startPlayerState("dead", deathDuration);
              player.invulnUntil = now + deathDuration;
              player.dodgeUntil = 0;
              log("Petani tumbang. Nyawa berkurang.");
            } else {
              const hitDuration = spriteSheets.player.hitDown.frames / playerAnimRates.hit;
              startPlayerState("hit", hitDuration);
              player.invulnUntil = now + 1;
            }
          }

          if (enemy.y <= getCoreHitY() + coreHitHeight / 2) {
            game.core.hp -= enemy.damage;
            enemy.hp = 0;
            enemy.reachedCore = true;
            startEnemyDeath(enemy);
            log("Inti desa diserang.");
          }
        });
      }

      function cleanupEnemies() {
        game.enemies.forEach((enemy) => {
          if (enemy.state === "dead" && !enemy.counted && !enemy.reachedCore) {
            enemy.counted = true;
            game.kills += 1;
          }
        });
        game.enemies = game.enemies.filter((enemy) => {
          if (enemy.state !== "dead") return true;
          const duration = enemy.deathDuration || 0.6;
          return enemy.stateTime < duration;
        });
      }

      function updateProjectiles(dt) {
        game.projectiles.forEach((shot) => {
          if (shot.hit) return;
          shot.x += shot.vx * dt;
          shot.y += shot.vy * dt;
          if (shot.spriteSrc) {
            shot.rotation = Math.atan2(shot.vy, shot.vx);
          }
          for (const enemy of game.enemies) {
            if (enemy.state === "dead" || enemy.state === "eaten") continue;
            const dx = enemy.x - shot.x;
            const dy = enemy.y - shot.y;
            if (dx * dx + dy * dy <= shot.radius * shot.radius * 9) {
              applyEnemyDamage(enemy, shot.damage);
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
        if (game.player.state === "dead") return;
        const weapon = weapons[game.player.weaponIndex];
        if (!weapon) return;
        const dx = targetX - game.player.x;
        const dy = targetY - game.player.y;
        const dist = Math.hypot(dx, dy);
        let angle = dist > 0.001 ? Math.atan2(dy, dx) : getFacingAngle(game.player.facing);
        faceTowards(dx, dy);
        game.player.attackAngle = angle;
        const attackType = weapon.attackType || "slice";
        const attackDuration = getAttackDuration(attackType);
        startPlayerState("attack", attackDuration, attackType);

        if (weapon.type === "melee") {
          performMeleeAttack(weapon, angle);
        } else {
          spawnProjectile(weapon, angle);
        }

        game.player.cooldown = weapon.cooldown;
      }

      function updatePlayer(dt) {
        const player = game.player;
        if (player.state !== "normal") {
          player.stateTime += dt;
          if (player.stateTime >= player.stateDuration) {
            player.state = "normal";
            player.stateTime = 0;
            player.stateDuration = 0;
          }
        }
        const canMove =
          game.phase === "pertahanan" ||
          game.phase === "persiapan";
        if (!canMove) {
          player.moving = false;
          player.animTime += dt * 0.35;
          return;
        }
        if (player.state === "dead") {
          player.moving = false;
          player.animTime += dt * 0.2;
          return;
        }
        let speed = player.speed;
        const now = performance.now() / 1000;
        if (now < player.dodgeUntil) {
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
          player.x += (vx / len) * speed * dt;
          player.y += (vy / len) * speed * dt;
        }

        const moving = Boolean(vx || vy);
        if (moving) {
          if (Math.abs(vx) > Math.abs(vy)) {
            player.facing = vx < 0 ? "left" : "right";
          } else {
            player.facing = vy < 0 ? "up" : "down";
          }
        }
        player.moving = moving;
        player.animTime += dt * (moving ? 1 : 0.4);

        const minX = boardOffsetX + 10;
        const maxX = boardOffsetX + boardWidth - 10;
        const minY = boardOffsetY + 10;
        const maxY = boardOffsetY + boardHeight - 10;
        player.x = clamp(player.x, minX, maxX);
        player.y = clamp(player.y, minY, maxY);

        if (player.cooldown > 0) {
          player.cooldown -= dt;
        }
      }

      function updateGame(dt) {
        if (game.paused) return;

        game.time += dt;
        updatePlayer(dt);
        syncSelectionToPlayer();

        if (game.phase === "pertahanan") {
          game.waveTimer += dt;
          while (game.spawnQueue.length && game.spawnQueue[0].time <= game.waveTimer) {
            const spawn = game.spawnQueue.shift();
            spawnEnemy(spawn.type, spawn.col);
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

      function getEnemyScaling(level, wave) {
        const levelBoost = Math.max(0, level - 1);
        const waveBoost = Math.max(0, wave - 1);
        return {
          hp: 1 + levelBoost * 0.12 + waveBoost * 0.06,
          damage: 1 + levelBoost * 0.1 + waveBoost * 0.05,
          speed: 1 + levelBoost * 0.03 + waveBoost * 0.015,
          attackRate: clamp(0.8 - levelBoost * 0.05 - waveBoost * 0.02, 0.35, 0.8),
        };
      }

      function spawnEnemy(type, col) {
        const def = enemyDefs[type];
        if (!def) return;
        const scaling = getEnemyScaling(game.level, game.waveInMap);
        const speed = Math.max(
          6,
          def.speed * (1 + game.weather.enemySpeed) * scaling.speed
        );
        const x = gridStartX + col * cellSize + cellSize / 2;
        const y = boardOffsetY + boardHeight + 24;
        game.enemies.push({
          type,
          col,
          x,
          y,
          hp: Math.round(def.hp * scaling.hp),
          maxHp: Math.round(def.hp * scaling.hp),
          speed,
          damage: Math.round(def.damage * scaling.damage),
          color: def.color,
          slowUntil: 0,
          slowFactor: 1,
          attackRate: scaling.attackRate,
          attackCooldown: scaling.attackRate * 0.5,
          reachedCore: false,
          counted: false,
          animOffset: Math.random() * 4,
          moving: true,
          state: "run",
          stateTime: 0,
          deathDuration: 0,
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
            const y = boardOffsetY + row * cellSize;
            ctx.fillStyle = (row + col) % 2 === 0 ? light : dark;
            ctx.fillRect(x, y, cellSize, cellSize);
          }
        }
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        for (let row = 0; row <= rows; row += 1) {
          ctx.beginPath();
          ctx.moveTo(gridStartX, boardOffsetY + row * cellSize);
          ctx.lineTo(gridEndX, boardOffsetY + row * cellSize);
          ctx.stroke();
        }
        for (let col = 0; col <= cols; col += 1) {
          ctx.beginPath();
          ctx.moveTo(gridStartX + col * cellSize, boardOffsetY);
          ctx.lineTo(gridStartX + col * cellSize, boardOffsetY + boardHeight);
          ctx.stroke();
        }
      }

      function drawCore() {
        const marker = getCoreMarkerPosition();
        const barWidth = 92;
        const barHeight = 8;
        const ratio = clamp(game.core.hp / game.core.maxHp, 0, 1);

        ctx.save();
        ctx.fillStyle = "rgba(20, 16, 10, 0.6)";
        ctx.fillRect(
          Math.round(marker.x - barWidth / 2 - 3),
          Math.round(marker.y + 22),
          barWidth + 6,
          barHeight + 6
        );
        drawPixelBar(
          Math.round(marker.x - barWidth / 2),
          Math.round(marker.y + 25),
          barWidth,
          barHeight,
          ratio,
          "#8ee26b",
          "#2f3b2f",
          "#131018"
        );
        ctx.restore();
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
        const panelW = 140;
        const panelH = 46;
        ctx.save();
        ctx.fillStyle = "rgba(20, 26, 36, 0.92)";
        ctx.fillRect(panelX, panelY, panelW, panelH);
        ctx.strokeStyle = "#d8b37a";
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX + 1, panelY + 1, panelW - 2, panelH - 2);

        const heartPixel = 1;
        const heartSize = 8 * heartPixel;
        const heartGap = 2;
        const maxHearts = 5;
        const heartsX = panelX + 8;
        const heartsY = panelY + 6;
        for (let i = 0; i < maxHearts; i += 1) {
          drawPixelHeart(
            heartsX + i * (heartSize + heartGap),
            heartsY,
            i < game.lives,
            heartPixel
          );
        }

        const barX = panelX + 8;
        const barW = panelW - 16;
        drawPixelBar(
          barX,
          panelY + 22,
          barW,
          8,
          game.player.hp / game.player.maxHp,
          "#7de065",
          "#2f3b2f",
          "#131018"
        );
        drawPixelBar(
          barX,
          panelY + 32,
          barW,
          8,
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

      function drawPlantSprite(plant, x, y) {
        const def = plantDefs[plant.type];
        const img = def && def.sprite ? getSpriteImage(def.sprite) : null;
        if (!img) {
          drawPlantGlyph(plant.type, x, y, def ? def.color : "#6b4e2e");
          return;
        }
        const scale = def.spriteScale || 0.6;
        const targetSize = Math.max(12, Math.round(cellSize * scale));
        let drawW = targetSize;
        let drawH = targetSize;
        if (img.width && img.height) {
          const aspect = img.width / img.height;
          if (aspect >= 1) {
            drawW = targetSize;
            drawH = Math.max(1, Math.round(targetSize / aspect));
          } else {
            drawH = targetSize;
            drawW = Math.max(1, Math.round(targetSize * aspect));
          }
        }
        const offsetY = def.spriteOffsetY || 0;
        ctx.drawImage(
          img,
          Math.round(x - drawW / 2),
          Math.round(y - drawH / 2 + offsetY),
          drawW,
          drawH
        );
      }

      function drawPlants() {
        game.plants.forEach((plant) => {
          const def = plantDefs[plant.type];
          const center = cellCenter(plant.row, plant.col);
          drawPlantSprite(plant, center.x, center.y);

          const barWidth = 36;
          const barHeight = 4;
          const barX = center.x - barWidth / 2;
          const hpRatio = clamp(plant.hp / plant.maxHp, 0, 1);
          const maxShield = plant.maxShield || 0;
          const shieldRatio = maxShield
            ? clamp((plant.shield || 0) / maxShield, 0, 1)
            : 0;

          if (maxShield > 0) {
            ctx.fillStyle = "rgba(0,0,0,0.25)";
            ctx.fillRect(barX, center.y - 30, barWidth, barHeight);
            ctx.fillStyle = "#60a5fa";
            ctx.fillRect(barX, center.y - 30, barWidth * shieldRatio, barHeight);
            ctx.fillStyle = "rgba(0,0,0,0.25)";
            ctx.fillRect(barX, center.y - 24, barWidth, barHeight);
            ctx.fillStyle = "#a7f3d0";
            ctx.fillRect(barX, center.y - 24, barWidth * hpRatio, barHeight);
          } else {
            ctx.fillStyle = "rgba(0,0,0,0.2)";
            ctx.fillRect(barX, center.y - 26, barWidth, barHeight);
            ctx.fillStyle = "#a7f3d0";
            ctx.fillRect(barX, center.y - 26, barWidth * hpRatio, barHeight);
          }
        });
      }


      function drawEnemyBody(enemy) {
        const x = enemy.x;
        const y = enemy.y;
        const radius = enemyBaseSize * 0.22;
        ctx.fillStyle = enemy.color || "#6ce0c6";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#1f1f1f";
        ctx.beginPath();
        ctx.arc(x - radius * 0.35, y - radius * 0.15, 2.5, 0, Math.PI * 2);
        ctx.arc(x + radius * 0.35, y - radius * 0.15, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      function drawEnemies() {
        game.enemies.forEach((enemy) => {
          const sprite = getEnemySprite(enemy.type);
          const isDead = enemy.state === "dead";
          const isEaten = enemy.state === "eaten";
          const moving = enemy.moving;
          const sheet = sprite
            ? isDead
              ? sprite.death
              : moving
                ? sprite.run
                : sprite.idle
            : null;
          const img = sheet ? getSpriteImage(sheet.src) : null;
          const frames = sheet ? sheet.frames : 0;
          const fps = isDead
            ? enemyAnimRates.death
            : moving
              ? enemyAnimRates.run
              : enemyAnimRates.idle;
          const frameIndex = frames
            ? (() => {
                const raw = Math.floor(
                  (isDead ? enemy.stateTime : game.time + enemy.animOffset) * fps
                );
                return isDead ? Math.min(frames - 1, raw) : raw % frames;
              })()
            : 0;
          const frameW = sheet ? sheet.frameW : 32;
          const frameH = sheet ? sheet.frameH : 32;
          const scale = sheet ? enemyBaseSize / frameH : 1.05;

          if (isEaten) {
            ctx.save();
            ctx.globalAlpha = 0.6;
          }
          ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
          ctx.beginPath();
          ctx.ellipse(
            enemy.x,
            enemy.y + enemyBaseSize * 0.3,
            enemyBaseSize * 0.45,
            enemyBaseSize * 0.18,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          if (!drawSpriteFrame(img, frameIndex, enemy.x, enemy.y, frameW, frameH, scale, false)) {
            drawEnemyBody(enemy);
          }
          if (isEaten) {
            ctx.restore();
          }
          if (enemy.state !== "dead") {
            const ratio = clamp(enemy.hp / enemy.maxHp, 0, 1);
            const barWidth = enemyBaseSize * 0.5;
            const barX = enemy.x - barWidth / 2;
            const barY = enemy.y - enemyBaseSize * 0.45;
            ctx.fillStyle = "rgba(0,0,0,0.25)";
            ctx.fillRect(barX, barY, barWidth, 4);
            ctx.fillStyle = "#ffbe0b";
            ctx.fillRect(barX, barY, barWidth * ratio, 4);
          }
        });
      }

      function drawPlayer() {
        const now = performance.now() / 1000;
        const player = game.player;
        const invuln = now < player.invulnUntil;
        const dodge = now < player.dodgeUntil;
        const sprites = spriteSheets.player;
        const frameW = sprites.frameW;
        const frameH = sprites.frameH;

        const facing = player.facing;
        const moving = player.moving;
        let sheet = sprites.idleDown;
        let frames = sheet.frames;
        let flip = false;
        let fps = playerAnimRates.idle;
        let useStateTime = false;

        if (player.state === "dead") {
          if (facing === "up") {
            sheet = sprites.deathUp;
          } else if (facing === "down") {
            sheet = sprites.deathDown;
          } else {
            sheet = sprites.deathSide;
            flip = facing === "left";
          }
          frames = sheet.frames;
          fps = playerAnimRates.death;
          useStateTime = true;
        } else if (player.state === "hit") {
          if (facing === "up") {
            sheet = sprites.hitUp;
          } else if (facing === "down") {
            sheet = sprites.hitDown;
          } else {
            sheet = sprites.hitSide;
            flip = facing === "left";
          }
          frames = sheet.frames;
          fps = playerAnimRates.hit;
          useStateTime = true;
        } else if (player.state === "attack") {
          const attackSet =
            player.attackType === "pierce"
              ? { down: sprites.pierceDown, up: sprites.pierceUp, side: sprites.pierceSide }
              : { down: sprites.sliceDown, up: sprites.sliceUp, side: sprites.sliceSide };
          if (facing === "up") {
            sheet = attackSet.up;
          } else if (facing === "down") {
            sheet = attackSet.down;
          } else {
            sheet = attackSet.side;
            flip = facing === "left";
          }
          frames = sheet.frames;
          fps = playerAnimRates.attack;
          useStateTime = true;
        } else if (moving) {
          if (facing === "up") {
            sheet = sprites.runUp;
          } else if (facing === "down") {
            sheet = sprites.runDown;
          } else {
            sheet = sprites.runSide;
            flip = facing === "left";
          }
          frames = sheet.frames;
          fps = playerAnimRates.run;
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
          fps = playerAnimRates.idle;
        }

        const img = getSpriteImage(sheet.src);
        const frameIndex = useStateTime
          ? Math.min(frames - 1, Math.floor(player.stateTime * fps))
          : Math.floor(player.animTime * fps) % frames;

        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.beginPath();
        ctx.ellipse(player.x, player.y + 18, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        if (!drawSpriteFrame(img, frameIndex, player.x, player.y, frameW, frameH, 1.1, flip)) {
          ctx.fillStyle = invuln ? "#f77f00" : "#f4d35e";
          ctx.beginPath();
          ctx.arc(player.x, player.y, 10, 0, Math.PI * 2);
          ctx.fill();
        }

        const armor = armorOptions[player.armorIndex];
        if (armor && armor.src) {
          const armorImg = getSpriteImage(armor.src);
          if (armorImg) {
            const armorSize = Math.round(frameW * 0.3);
            const armorOffsetY = 10;
            ctx.save();
            ctx.translate(Math.round(player.x), Math.round(player.y));
            if (flip) {
              ctx.scale(-1, 1);
            }
            ctx.drawImage(
              armorImg,
              -armorSize / 2,
              -armorSize / 2 + armorOffsetY,
              armorSize,
              armorSize
            );
            ctx.restore();
          }
        }

        drawHeldWeapon(player);

        if (player.state !== "dead") {
          if (dodge) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(player.x, player.y + 6, 18, 0, Math.PI * 2);
            ctx.stroke();
          } else if (invuln) {
            ctx.strokeStyle = "rgba(255, 210, 120, 0.6)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(player.x, player.y + 6, 16, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }

      function drawProjectiles() {
        game.projectiles.forEach((shot) => {
          if (shot.hidden) return;
          if (shot.spriteSrc) {
            const img = getSpriteImage(shot.spriteSrc);
            if (img) {
              const size = shot.size || 18;
              ctx.save();
              ctx.translate(Math.round(shot.x), Math.round(shot.y));
              ctx.rotate(shot.rotation || 0);
              ctx.drawImage(img, -size / 2, -size / 2, size, size);
              ctx.restore();
              return;
            }
          }
          ctx.fillStyle = shot.color || "#f4d35e";
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
          if (effect.type === "slash") {
            const life = effect.life || 0.2;
            const alpha = clamp(effect.ttl / life, 0, 1);
            ctx.save();
            ctx.strokeStyle = effect.color || "#d6f3ff";
            ctx.globalAlpha = alpha;
            ctx.lineWidth = effect.width || 12;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.arc(
              effect.x,
              effect.y,
              effect.radius,
              effect.angle - effect.arc / 2,
              effect.angle + effect.arc / 2
            );
            ctx.stroke();
            ctx.restore();
            return;
          }
          const life = effect.life || 0.15;
          ctx.save();
          ctx.strokeStyle = effect.color;
          ctx.globalAlpha = clamp(effect.ttl / life, 0, 1);
          ctx.lineWidth = effect.width || 2;
          ctx.lineCap = "round";
          if (effect.segmented) {
            const dx = effect.x2 - effect.x1;
            const dy = effect.y2 - effect.y1;
            const dist = Math.hypot(dx, dy);
            if (dist > 0.01) {
              const ux = dx / dist;
              const uy = dy / dist;
              const count = effect.segmentCount || 3;
              const segLen = effect.segmentLength || Math.max(8, Math.min(18, dist / 6));
              const spacing = Math.max(0, (dist - count * segLen) / (count + 1));
              let cursor = spacing;
              ctx.beginPath();
              for (let i = 0; i < count; i += 1) {
                const sx = effect.x1 + ux * cursor;
                const sy = effect.y1 + uy * cursor;
                const ex = effect.x1 + ux * (cursor + segLen);
                const ey = effect.y1 + uy * (cursor + segLen);
                ctx.moveTo(sx, sy);
                ctx.lineTo(ex, ey);
                cursor += segLen + spacing;
              }
              ctx.stroke();
            }
          } else {
            if (effect.dash) {
              ctx.setLineDash(effect.dash);
            }
            ctx.beginPath();
            ctx.moveTo(effect.x1, effect.y1);
            ctx.lineTo(effect.x2, effect.y2);
            ctx.stroke();
          }
          ctx.restore();
        });
      }

      function drawSelection() {
        if (game.phase !== "persiapan") return;
        const cell = hoverCell || selectedCell;
        if (!cell) return;
        const x = gridStartX + cell.col * cellSize;
        const y = boardOffsetY + cell.row * cellSize;
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
        updateBoardLayout();
        game.time = 0;
        game.mapIndex = 0;
        game.waveInMap = 1;
        game.mapCycle = 0;
        game.phase = "persiapan";
        game.coins = 60;
        game.lootTotals = { koin: 0, berlian: 0, ruby: 0 };
        game.materials = 4;
        game.trophies = 0;
        game.seeds = { mage: 0, slow: 0, heal: 0, buff: 0 };
        game.core = { hp: 120, maxHp: 120 };
        game.lives = 3;
        game.xp = 0;
        game.level = 1;
        game.skillPoints = 0;
        game.skills = { farming: 0, combat: 0 };
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
        game.armorOwned = { none: true };
        game.weaponOwned = { pedang: true };
        game.plants = [];
        game.enemies = [];
        game.projectiles = [];
        game.effects = [];
        game.spawnQueue = [];
        game.waveTimer = 0;
        game.kills = 0;
        game.paused = false;
        game.player = {
          x: gridStartX + 20,
          y: boardOffsetY + boardHeight / 2,
          speed: 140,
          weaponIndex: 0,
          cooldown: 0,
          invulnUntil: 0,
          dodgeUntil: 0,
          dodgeCooldownUntil: 0,
          facing: "down",
          moving: false,
          animTime: 0,
          state: "normal",
          stateTime: 0,
          stateDuration: 0,
          attackType: "slice",
          attackAngle: 0,
          armorIndex: 0,
          hp: 100,
          maxHp: 100,
        };
        selectedArmorIndex = 0;
        selectedWeaponIndex = 0;
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

      function openTutorial() {
        const body = `
          <div class="tutorial-grid">
            <div class="panel-section">
              <h2>Cara Bermain</h2>
              <div class="guide-list">
                <div>1. Pilih benih lalu tanam di petak saat persiapan.</div>
                <div>2. Tekan Enter untuk mulai pertahanan.</div>
                <div>3. Serang musuh dan lindungi inti desa.</div>
                <div>4. Setelah gelombang, eksplor dan tingkatkan desa.</div>
              </div>
            </div>
            <div class="panel-section">
              <h2>Kontrol</h2>
              <div class="control-list">
                <div>WASD / Panah: Gerak petani (kursor tanam mengikuti posisi)</div>
                <div>F: Tanam / panen di kursor</div>
                <div>Klik kiri: Serang musuh</div>
                <div>Roda mouse: Ganti senjata</div>
                <div>Spasi: Menghindar singkat</div>
                <div>Enter: Mulai pertahanan</div>
                <div>E: Menu karakter</div>
                <div>ESC: Jeda</div>
              </div>
            </div>
          </div>
        `;
        showOverlay("Tutorial", body, [
          { label: "Tutup", className: "secondary", onClick: hideOverlay },
        ]);
      }

      function openShopMenu() {
        if (shopUi) {
          hideOverlay();
          return;
        }
        if (ui.overlay.classList.contains("show")) {
          hideOverlay();
        }
        toggleCoinMenu(false);
        const body = `
          <div class="shop-grid">
            <div class="panel-section shop-section">
              <h2>Toko Armor</h2>
              <div class="armor-picker">
                <div class="armor-preview">
                  <img id="shopArmorPreview" alt="Preview armor" />
                </div>
                <div>
                  <div id="shopArmorName" class="armor-name">Armor</div>
                  <div id="shopArmorPrice" class="armor-price">Harga: -</div>
                </div>
              </div>
              <div class="button-row">
                <button id="shopArmorPrev" type="button" class="secondary">Sebelumnya</button>
                <button id="shopArmorNext" type="button">Berikutnya</button>
                <button id="shopArmorAction" type="button" class="secondary">Beli</button>
              </div>
            </div>
            <div class="panel-section shop-section">
              <h2>Toko Senjata</h2>
              <div class="armor-picker">
                <div class="armor-preview">
                  <img id="shopWeaponPreview" alt="Preview senjata" />
                </div>
                <div>
                  <div id="shopWeaponName" class="armor-name">Senjata</div>
                  <div id="shopWeaponPrice" class="armor-price">Harga: -</div>
                </div>
              </div>
              <div class="button-row">
                <button id="shopWeaponPrev" type="button" class="secondary">Sebelumnya</button>
                <button id="shopWeaponNext" type="button">Berikutnya</button>
                <button id="shopWeaponAction" type="button" class="secondary">Beli</button>
              </div>
            </div>
          </div>
        `;
        showOverlay("Toko Peralatan", body, [
          { label: "Tutup", className: "secondary", onClick: hideOverlay },
        ]);

        shopUi = {
          armorName: document.getElementById("shopArmorName"),
          armorPreview: document.getElementById("shopArmorPreview"),
          armorPrice: document.getElementById("shopArmorPrice"),
          armorPrev: document.getElementById("shopArmorPrev"),
          armorNext: document.getElementById("shopArmorNext"),
          armorAction: document.getElementById("shopArmorAction"),
          weaponName: document.getElementById("shopWeaponName"),
          weaponPreview: document.getElementById("shopWeaponPreview"),
          weaponPrice: document.getElementById("shopWeaponPrice"),
          weaponPrev: document.getElementById("shopWeaponPrev"),
          weaponNext: document.getElementById("shopWeaponNext"),
          weaponAction: document.getElementById("shopWeaponAction"),
        };

        if (ui.shopSlot) {
          ui.shopSlot.setAttribute("aria-expanded", "true");
        }

        if (shopUi.armorPrev) {
          shopUi.armorPrev.addEventListener("click", () => {
            setArmorIndex(selectedArmorIndex - 1);
          });
        }
        if (shopUi.armorNext) {
          shopUi.armorNext.addEventListener("click", () => {
            setArmorIndex(selectedArmorIndex + 1);
          });
        }
        if (shopUi.armorAction) {
          shopUi.armorAction.addEventListener("click", () => {
            const armor = armorOptions[selectedArmorIndex];
            if (!armor) return;
            if (game.armorOwned[armor.id]) {
              equipArmor(selectedArmorIndex);
            } else {
              buyArmor(selectedArmorIndex);
            }
            updateShopOverlay();
          });
        }
        if (shopUi.weaponPrev) {
          shopUi.weaponPrev.addEventListener("click", () => {
            setWeaponIndex(selectedWeaponIndex - 1);
          });
        }
        if (shopUi.weaponNext) {
          shopUi.weaponNext.addEventListener("click", () => {
            setWeaponIndex(selectedWeaponIndex + 1);
          });
        }
        if (shopUi.weaponAction) {
          shopUi.weaponAction.addEventListener("click", () => {
            const weapon = weapons[selectedWeaponIndex];
            if (!weapon) return;
            if (game.weaponOwned[weapon.id]) {
              equipWeapon(selectedWeaponIndex);
            } else {
              buyWeapon(selectedWeaponIndex);
            }
            updateShopOverlay();
          });
        }
        updateShopOverlay();
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
      if (ui.startDefenseAlt) {
        ui.startDefenseAlt.addEventListener("click", () => {
          if (!hasStarted) {
            startGame();
          }
          startDefense();
        });
      }
      ui.toUpgrade.addEventListener("click", openUpgradePhase);
      ui.nextDay.addEventListener("click", nextDay);
      ui.resetGame.addEventListener("click", resetGame);
      if (startButton) {
        startButton.addEventListener("click", startGame);
      }
      if (tutorialButton) {
        tutorialButton.addEventListener("click", openTutorial);
      }
      if (ui.pauseButton) {
        ui.pauseButton.addEventListener("click", openPauseMenu);
      }
      if (ui.miniMapButton) {
        ui.miniMapButton.addEventListener("click", openMiniMap);
      }
      if (ui.inventoryToggle) {
        ui.inventoryToggle.addEventListener("click", () => {
          toggleInventoryPanel();
        });
      }
      if (ui.mapSelect) {
        ui.mapSelect.addEventListener("change", () => {
          const nextIndex = Number.parseInt(ui.mapSelect.value, 10);
          if (Number.isNaN(nextIndex)) return;
          if (!setMapIndex(nextIndex)) {
            ui.mapSelect.value = String(game.mapIndex);
          }
        });
      }
      if (ui.levelSelect) {
        ui.levelSelect.addEventListener("change", () => {
          const nextLevel = Number.parseInt(ui.levelSelect.value, 10);
          if (Number.isNaN(nextLevel)) return;
          if (!setLevel(nextLevel)) {
            ui.levelSelect.value = String(game.level);
          }
        });
      }
      ui.toggleHarvest.addEventListener("click", () => {
        harvestMode = !harvestMode;
        ui.toggleHarvest.textContent = `Mode Panen: ${harvestMode ? "Nyala" : "Mati"}`;
      });
      ui.upgradeCore.addEventListener("click", upgradeCore);
      ui.upgradePlants.addEventListener("click", upgradePlants);
      ui.upgradePlayer.addEventListener("click", upgradePlayer);
      ui.upgradeFarm.addEventListener("click", upgradeFarm);
      if (ui.armorPrev) {
        ui.armorPrev.addEventListener("click", () => {
          setArmorIndex(selectedArmorIndex - 1);
        });
      }
      if (ui.armorNext) {
        ui.armorNext.addEventListener("click", () => {
          setArmorIndex(selectedArmorIndex + 1);
        });
      }
      if (ui.armorAction) {
        ui.armorAction.addEventListener("click", () => {
          const armor = armorOptions[selectedArmorIndex];
          if (!armor) return;
          if (game.armorOwned[armor.id]) {
            equipArmor(selectedArmorIndex);
          } else {
            buyArmor(selectedArmorIndex);
          }
        });
      }
      if (ui.weaponPrev) {
        ui.weaponPrev.addEventListener("click", () => {
          setWeaponIndex(selectedWeaponIndex - 1);
        });
      }
      if (ui.weaponNext) {
        ui.weaponNext.addEventListener("click", () => {
          setWeaponIndex(selectedWeaponIndex + 1);
        });
      }
      if (ui.weaponAction) {
        ui.weaponAction.addEventListener("click", () => {
          const weapon = weapons[selectedWeaponIndex];
          if (!weapon) return;
          if (game.weaponOwned[weapon.id]) {
            equipWeapon(selectedWeaponIndex);
          } else {
            buyWeapon(selectedWeaponIndex);
          }
        });
      }
      if (seedSlots.length) {
        seedSlots.forEach((slot) => {
          slot.addEventListener("click", () => {
            const key = slot.dataset.seed;
            if (!key) return;
            selectPlant(key);
          });
        });
      }
      if (ui.coinSlot) {
        ui.coinSlot.addEventListener("click", (event) => {
          event.stopPropagation();
          toggleCoinMenu();
        });
      }
      if (ui.shopSlot) {
        ui.shopSlot.addEventListener("click", (event) => {
          event.stopPropagation();
          openShopMenu();
        });
      }
      if (ui.coinMenu) {
        ui.coinMenu.addEventListener("click", (event) => {
          event.stopPropagation();
        });
      }
      window.addEventListener("click", (event) => {
        const target = event.target;
        if (ui.tasPanel && ui.inventoryToggle) {
          const clickedPanel = ui.tasPanel.contains(target);
          const clickedToggle = ui.inventoryToggle.contains(target);
          const clickedCanvas = canvas ? canvas.contains(target) : false;
          if (
            ui.tasPanel.classList.contains("show") &&
            !clickedPanel &&
            !clickedToggle &&
            !clickedCanvas
          ) {
            toggleInventoryPanel(false);
          }
        }
        if (ui.coinMenu && ui.coinSlot) {
          const clickedCoin = ui.coinMenu.contains(target) || ui.coinSlot.contains(target);
          if (!clickedCoin) {
            toggleCoinMenu(false);
          }
        }
      });

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
          const nextIndex = getNextOwnedWeaponIndex(game.player.weaponIndex, dir);
          game.player.weaponIndex = nextIndex;
          selectedWeaponIndex = nextIndex;
          updateUI();
        },
        { passive: false }
      );

      function getMoveKey(event) {
        if (event.code === "KeyW" || event.code === "ArrowUp") return "w";
        if (event.code === "KeyS" || event.code === "ArrowDown") return "s";
        if (event.code === "KeyA" || event.code === "ArrowLeft") return "a";
        if (event.code === "KeyD" || event.code === "ArrowRight") return "d";
        const key = event.key.toLowerCase();
        if (key === "w" || key === "a" || key === "s" || key === "d") return key;
        return null;
      }

      function applySelectionMove(moveKey) {
        if (moveKey === "w") selectedCell.row = clamp(selectedCell.row - 1, 0, rows - 1);
        if (moveKey === "s") selectedCell.row = clamp(selectedCell.row + 1, 0, rows - 1);
        if (moveKey === "a") selectedCell.col = clamp(selectedCell.col - 1, 0, cols - 1);
        if (moveKey === "d") selectedCell.col = clamp(selectedCell.col + 1, 0, cols - 1);
      }

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
          if (ui.tasPanel && ui.tasPanel.classList.contains("show")) {
            toggleInventoryPanel(false);
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
        if (key === "enter" && game.phase === "persiapan") {
          startDefense();
          event.preventDefault();
          return;
        }
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
          event.preventDefault();
          return;
        }

        const moveKey = getMoveKey(event);
        if (moveKey) {
          keys[moveKey] = true;
          if (game.phase === "persiapan") {
            applySelectionMove(moveKey);
          }
          event.preventDefault();
        }
      });

      window.addEventListener("keyup", (event) => {
        const moveKey = getMoveKey(event);
        if (moveKey) {
          keys[moveKey] = false;
          event.preventDefault();
        }
      });

      window.addEventListener("blur", () => {
        keys.w = false;
        keys.a = false;
        keys.s = false;
        keys.d = false;
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
      setupSettingsControls();
      renderCoinMenu();
      resetGame();
      requestAnimationFrame(loop);
