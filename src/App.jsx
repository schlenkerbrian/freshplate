import { useState, useEffect } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { getRecipeIngredients } from "./spoonacular";
import { krogerFindLocation, krogerSearchProducts } from "./kroger";
import BottomNav from "./components/BottomNav";
import OnboardingFlow from "./components/OnboardingFlow";
import Cookbook from "./pages/Cookbook";
import Meals from "./pages/Meals";
import GroceryList from "./pages/GroceryList";
import Pantry from "./pages/Pantry";
import Deals from "./pages/Deals";
import Profile from "./pages/Profile";
import { getUnitSize } from "./data/unitSizes";
import { getAisle } from "./data/aisleData";
import { buildShoppingPlan } from "./storePricing";

function createInitialPantry() {
  return [
    { id: crypto.randomUUID(), name: "Olive Oil",    emoji: "🛢️", qty: 1,  unit: "bottle", status: "ok",   expiry: "2026-12-01", datePurchased: "2026-01-01" },
    { id: crypto.randomUUID(), name: "Eggs",         emoji: "🥚", qty: 12, unit: "ct",     status: "ok",   expiry: "2026-06-28", datePurchased: "2026-06-15" },
    { id: crypto.randomUUID(), name: "Butter",       emoji: "🧈", qty: 1,  unit: "lb",     status: "ok",   expiry: "2026-07-15", datePurchased: "2026-06-01" },
    { id: crypto.randomUUID(), name: "Chicken",      emoji: "🍗", qty: 2,  unit: "lb",     status: "soon", expiry: "2026-06-22", datePurchased: "2026-06-18" },
    { id: crypto.randomUUID(), name: "Spinach",      emoji: "🥬", qty: 1,  unit: "bag",    status: "soon", expiry: "2026-06-21", datePurchased: "2026-06-17" },
    { id: crypto.randomUUID(), name: "Soy Sauce",    emoji: "🍶", qty: 1,  unit: "bottle", status: "ok",   expiry: "2027-01-01", datePurchased: "2025-12-01" },
  ];
}

export default function App() {
  const [prefs, setPrefs]         = useLocalStorage("fp2_prefs", null);
  const [pantry, setPantry]       = useLocalStorage("fp2_pantry", createInitialPantry());
  const [mealQueue, setMealQueue] = useLocalStorage("fp2_queue", []);
  const [groceryList, setGroceryList] = useLocalStorage("fp2_grocery", []);
  const [favorites, setFavorites] = useLocalStorage("fp2_favorites", []);
  const [myRecipes, setMyRecipes] = useLocalStorage("fp2_myrecipes", []);
  const [krogerLocation, setKrogerLocation] = useLocalStorage("fp2_krogerLocation", null);
  const [activeTab, setActiveTab] = useState("cookbook");

  useEffect(() => {
    if (!prefs?.zipCode || !prefs?.stores?.includes("kroger")) return;
    if (krogerLocation?.zipCode === prefs.zipCode) return; // already resolved
    krogerFindLocation(prefs.zipCode)
      .then(loc => loc && setKrogerLocation({ ...loc, zipCode: prefs.zipCode }))
      .catch(() => {});
  }, [prefs?.zipCode, prefs?.stores?.join(",")]);

  function addToQueue(recipe, mealType) {
    setMealQueue(prev => [...prev, { id: crypto.randomUUID(), recipe, mealType, addedAt: Date.now() }]);
  }

  function removeFromQueue(id) {
    setMealQueue(prev => prev.filter(q => q.id !== id));
  }

  async function sendToGrocery() {
    if (!mealQueue.length) return;
    try {
      const ingredients = await getRecipeIngredients(mealQueue.map(q => q.recipe.id));
      const pantryNames = pantry.map(p => (p.name ?? "").toLowerCase());
      const storeIds = prefs?.stores?.length ? prefs.stores : ["kroger"];

      const missing = ingredients.filter(ing =>
        !pantryNames.some(p => p.includes(ing.name.toLowerCase()))
      );

      const plan = buildShoppingPlan(missing, storeIds);

      // Enrich Kroger items with real prices
      const krogerRows = plan.filter(row => row.bestStore === "kroger");
      if (krogerRows.length > 0) {
        await Promise.allSettled(
          krogerRows.map(async row => {
            try {
              const results = await krogerSearchProducts(row.item.name, krogerLocation?.locationId ?? null, 1);
              if (results[0]?.price) {
                console.log(`Kroger price for "${row.item.name}": $${results[0].price} (was $${row.price})`);
                row.price = results[0].price;
              }
            } catch (err) {
              console.warn(`Kroger price lookup failed for "${row.item.name}":`, err.message);
            }
          })
        );
      }

      setGroceryList(prev => {
        const updated = [...prev];
        for (const row of plan) {
          const { item, bestStore, price } = row;
          const unitSize = getUnitSize(item.name);
          const aisle = getAisle(item.name);
          const existingIdx = updated.findIndex(e => e.name.toLowerCase() === item.name.toLowerCase());
          if (existingIdx >= 0) {
            updated[existingIdx] = {
              ...updated[existingIdx],
              amount: (parseFloat(updated[existingIdx].amount) || 0) + (item.amount || 1),
            };
          } else {
            updated.push({
              id: crypto.randomUUID(),
              name: item.name,
              amount: item.amount ?? 1,
              unit: item.unit ?? "",
              sellQty: unitSize?.sellQty ?? null,
              sellUnit: unitSize?.sellUnit ?? null,
              storeId: bestStore,
              aisle,
              checked: false,
              estimatedPrice: price,
            });
          }
        }
        return updated;
      });
    } catch (err) {
      console.error("sendToGrocery error:", err);
    }
  }

  async function cookedMeal(queueItem) {
    removeFromQueue(queueItem.id);
    try {
      const ingredients = await getRecipeIngredients([queueItem.recipe.id]);
      setPantry(prev => {
        const updated = [...prev];
        for (const ing of ingredients) {
          const idx = updated.findIndex(p => (p.name ?? "").toLowerCase().includes(ing.name.toLowerCase()));
          if (idx >= 0) {
            const newQty = (parseFloat(updated[idx].qty) || 0) - (ing.amount || 1);
            if (newQty <= 0) {
              updated.splice(idx, 1);
            } else {
              updated[idx] = { ...updated[idx], qty: newQty };
            }
          }
        }
        return updated;
      });
    } catch (err) {
      console.error("cookedMeal error:", err);
    }
  }

  function addToPantry(items) {
    setPantry(prev => {
      const updated = [...prev];
      for (const item of items) {
        const existingIdx = updated.findIndex(p =>
          String(p.id) === String(item.id) ||
          (p.name ?? "").toLowerCase() === (item.name ?? "").toLowerCase()
        );
        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            qty: (parseFloat(updated[existingIdx].qty) || 0) + (parseFloat(item.qty) || 1),
          };
        } else {
          updated.push({
            id: crypto.randomUUID(),
            name: item.name ?? "Unknown",
            emoji: item.emoji ?? "🛒",
            qty: item.amount ?? item.qty ?? 1,
            unit: item.sellUnit ?? item.unit ?? "item",
            status: "ok",
            expiry: "Unknown",
            datePurchased: new Date().toISOString().split("T")[0],
          });
        }
      }
      return updated;
    });
  }

  function removeFromPantry(id) {
    setPantry(prev => prev.filter(i => String(i.id) !== String(id)));
  }

  function toggleFavorite(recipe) {
    setFavorites(prev => {
      const exists = prev.some(f => f.id === recipe.id);
      return exists ? prev.filter(f => f.id !== recipe.id) : [...prev, recipe];
    });
  }

  function addToGroceryFromDeals(dealItem) {
    setGroceryList(prev => {
      const exists = prev.some(i => i.name.toLowerCase() === (dealItem.name ?? "").toLowerCase());
      if (exists) return prev;
      return [...prev, dealItem];
    });
  }

  if (!prefs) {
    return (
      <div style={{ background: "#dde8d8", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
        <div style={{ width: "100%", maxWidth: "430px", background: "#f4f6f0", minHeight: "100vh" }}>
          <OnboardingFlow onComplete={setPrefs} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#dde8d8", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
      <div style={{
        width: "100%", maxWidth: "430px", background: "#f4f6f0",
        minHeight: "100vh", position: "relative", paddingBottom: "72px",
        fontFamily: "-apple-system, Arial, sans-serif",
      }}>
        {activeTab === "cookbook" && (
          <Cookbook
            prefs={prefs}
            pantry={pantry}
            mealQueue={mealQueue}
            favorites={favorites}
            onAddToQueue={addToQueue}
            onToggleFavorite={toggleFavorite}
            myRecipes={myRecipes}
            onAddMyRecipe={r => setMyRecipes(prev => [...prev, r])}
            krogerLocationId={krogerLocation?.locationId ?? null}
          />
        )}
        {activeTab === "meals" && (
          <Meals
            mealQueue={mealQueue}
            pantry={pantry}
            onRemoveFromQueue={removeFromQueue}
            onSendToGrocery={sendToGrocery}
            onCookedMeal={cookedMeal}
            groceryList={groceryList}
          />
        )}
        {activeTab === "grocery" && (
          <GroceryList
            groceryList={groceryList}
            pantry={pantry}
            onUpdateList={setGroceryList}
            onAddToPantry={addToPantry}
            prefs={prefs}
            krogerLocationId={krogerLocation?.locationId ?? null}
          />
        )}
        {activeTab === "pantry" && (
          <Pantry
            pantry={pantry}
            onAdd={addToPantry}
            onRemove={removeFromPantry}
          />
        )}
        {activeTab === "deals" && (
          <Deals
            prefs={prefs}
            groceryList={groceryList}
            onAddToGroceryList={addToGroceryFromDeals}
            krogerLocationId={krogerLocation?.locationId ?? null}
            krogerLocation={krogerLocation}
          />
        )}
        {activeTab === "profile" && (
          <Profile
            prefs={prefs}
            onUpdatePrefs={setPrefs}
            favorites={favorites}
            myRecipes={myRecipes}
            onRemoveMyRecipe={id => setMyRecipes(prev => prev.filter(r => r.id !== id))}
          />
        )}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}
