"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  UtensilsCrossed, 
  DollarSign, 
  Layers,
  ChevronRight,
  Info,
  X,
  Trash2,
  Trash,
  ChefHat,
  Scale,
  Zap,
  Tag
} from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";
import { 
  Clock, 
  User, 
  TrendingUp, 
  CheckCircle2, 
  ArrowLeft,
  Settings2,
  Play
} from "lucide-react";

// Mock Price Mapping for Cost Calculation (Price per kg/l/unit)
const INGREDIENT_PRICES: Record<string, number> = {
  "Chicken": 350,
  "Rice": 60,
  "Milk": 65,
  "Sugar": 45,
  "Oil": 120,
  "Flour": 40,
  "Butter": 600,
  "Eggs": 6, // per piece
  "Salt": 20,
  "Spices": 1200,
  "Paneer": 450,
  "Tomato": 30,
  "Onion": 25,
};

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<any[]>([
    {
      id: "1",
      name: "Signature Chicken Biryani",
      description: "Authentic Dum biryani with long grain basmati rice, tender chicken, and secret spice blend.",
      category: "Main Course",
      basePrice: 450,
      prepTime: 45,
      difficulty: "Hard",
      servings: 2,
      steps: [
        "Marinate chicken with yogurt and spices for 2 hours.",
        "Parboil basmati rice with whole spices.",
        "Layer chicken and rice in a heavy bottom pot.",
        "Seal with dough and cook on low flame (dum) for 35 mins."
      ],
      items: [
        { name: "Chicken", quantity: 500, unit: "g" },
        { name: "Rice", quantity: 300, unit: "g" },
        { name: "Oil", quantity: 50, unit: "ml" },
        { name: "Spices", quantity: 20, unit: "g" },
      ]
    },
    {
      id: "2",
      name: "Classic Paneer Tikka",
      description: "Char-grilled paneer cubes marinated in spiced yogurt, served with mint chutney.",
      category: "Starter",
      basePrice: 280,
      prepTime: 25,
      difficulty: "Medium",
      servings: 3,
      steps: [
        "Cut paneer and vegetables into even cubes.",
        "Prepare marinade with hung curd, ginger-garlic paste and tikka masala.",
        "Coat paneer cubes and refrigerate for 45 mins.",
        "Skewer and grill in tandoor or oven until charred."
      ],
      items: [
        { name: "Paneer", quantity: 250, unit: "g" },
        { name: "Tomato", quantity: 100, unit: "g" },
        { name: "Onion", quantity: 100, unit: "g" },
        { name: "Butter", quantity: 20, unit: "g" },
      ]
    }
  ]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  // Builder State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: 0,
    category: "Main Course",
    prepTime: 30,
    difficulty: "Medium" as "Easy" | "Medium" | "Hard",
    servings: 4,
    steps: [] as string[],
    items: [] as any[] // { ingredientId, quantity, unit }
  });

  const [scalePortions, setScalePortions] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recipeRes, invRes] = await Promise.all([
        api.get('/api/recipes'),
        api.get('/api/inventory')
      ]);
      setRecipes(recipeRes.data);
      setInventory(invRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { ingredientId: "", quantity: 0, unit: "g" }]
    });
  };

  const handleRemoveIngredient = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const handleIngredientChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-set unit based on inventory item unit if it's the first time
    if (field === 'ingredientId') {
      const item = inventory.find(i => i.sku === value || i.name === value);
      if (item) {
        newItems[index].unit = item.unit === 'kg' ? 'g' : (item.unit === 'l' ? 'ml' : item.unit);
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/recipes', formData);
      setShowBuilder(false);
      fetchData();
    } catch (error) {
      console.error("Failed to save recipe:", error);
    }
  };

  const calculateFoodCost = (recipeItems: any[]) => {
    let total = 0;
    recipeItems.forEach(item => {
      const pricePerUnit = INGREDIENT_PRICES[item.name] || INGREDIENT_PRICES[item.ingredientId] || 100;
      let qty = item.quantity;
      
      // Basic unit conversion
      if (item.unit === 'g' || item.unit === 'ml') qty = qty / 1000;
      
      total += pricePerUnit * qty;
    });
    return total || recipeItems.length * 1.5; 
  };

  const getMarginStatus = (cost: number, price: number) => {
    const margin = ((price - cost) / price) * 100;
    if (margin >= 60) return { label: "Healthy", color: "text-emerald-500", bg: "bg-emerald-500/10" };
    if (margin >= 40) return { label: "At Risk", color: "text-amber-500", bg: "bg-amber-500/10" };
    return { label: "Critical", color: "text-red-500", bg: "bg-red-500/10" };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Recipe <span className="text-slate-400 font-medium ml-2">Architecture</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Production design for <span className="text-[#F58220] font-bold">Kiddos Foods</span> culinary lines.
          </p>
        </div>
        <button 
          onClick={() => {
            setFormData({ 
              name: "", 
              description: "", 
              basePrice: 0, 
              category: "Main Course", 
              prepTime: 30, 
              difficulty: "Medium", 
              servings: 4, 
              steps: [], 
              items: [] 
            });
            setShowBuilder(true);
          }}
          className="flex items-center gap-3 bg-[#F58220] text-white px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest shadow-md shadow-[#F58220]/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <ChefHat size={20} />
          Create New Recipe
        </button>
      </header>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Recipes", value: recipes.length, color: "primary", subtitle: "Active Menu" },
          { label: "Avg. Margin", value: "68.2%", color: "secondary", subtitle: "Target 60%+" },
        ].map((stat, i) => (
          <div key={i} className="group relative overflow-hidden bg-white dark:bg-card/40 backdrop-blur-xl p-8 rounded-[40px] border border-muted dark:border-white/10 shadow-xl shadow-black/[0.02]">
            <div className={clsx(
              "absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[60px] opacity-10 transition-all duration-700 group-hover:opacity-30",
              stat.color === 'primary' ? 'bg-primary' : 'bg-secondary'
            )} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 opacity-60 italic relative z-10">{stat.label}</p>
            <h3 className={clsx("text-4xl font-black tracking-tighter relative z-10", stat.color === 'primary' ? 'text-primary' : 'text-secondary')}>
              {stat.value}
            </h3>
            <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mt-2 relative z-10">{stat.subtitle}</p>
          </div>
        ))}
        
        <div className="relative overflow-hidden bg-white dark:bg-card/40 backdrop-blur-xl p-8 rounded-[40px] border border-muted dark:border-white/10 shadow-xl shadow-black/[0.02] lg:col-span-2 flex items-center justify-between group">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">PROFIT ENGINE</span>
            </div>
            <p className="text-lg text-foreground font-black tracking-tight leading-tight">3 recipes require <span className="text-primary italic">margin optimization</span>.</p>
          </div>
          <button className="relative z-10 px-8 py-3 bg-primary/10 border-2 border-primary/20 text-primary rounded-2xl text-[10px] font-black hover:bg-primary hover:text-white transition-all uppercase tracking-widest shadow-inner group-hover:scale-105">
            OPTIMIZE NOW
          </button>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/5 rounded-full blur-[100px] group-hover:bg-primary/10 transition-all duration-700" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-all duration-300" size={24} />
        <input 
          type="text" 
          placeholder="Search by dish name, category or specific ingredients..." 
          className="w-full pl-16 pr-6 py-5 bg-white dark:bg-card border-2 border-muted/50 dark:border-white/5 rounded-[24px] focus:border-primary/30 outline-none font-bold text-lg shadow-xl shadow-primary/5 transition-all"
        />
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-64 bg-white dark:bg-card rounded-[40px] animate-pulse border border-muted dark:border-white/5" />)
        ) : recipes.map((recipe) => {
          const cost = calculateFoodCost(recipe.items || []);
          const margin = getMarginStatus(cost, recipe.basePrice);
          return (
            <div 
              key={recipe.id} 
              onClick={() => setSelectedRecipe(recipe)}
              className="bg-white dark:bg-card rounded-[40px] border border-muted dark:border-white/5 overflow-hidden group hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-500 cursor-pointer"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                    {recipe.category || "Main"}
                  </span>
                  <div className={clsx("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5", margin.bg, margin.color)}>
                    <TrendingUp size={12} />
                    {margin.label}
                  </div>
                </div>
                
                <h3 className="text-2xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">{recipe.name}</h3>
                
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                    <Clock size={13} className="text-primary/70" />
                    {recipe.prepTime || 30}m
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                    <User size={13} className="text-secondary/70" />
                    {recipe.servings || 4} Portions
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mt-8 pt-8 border-t border-muted/50 dark:border-white/5">
                  <div>
                    <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground mb-1">Kit. Cost</p>
                    <p className="text-xl font-black text-foreground">₹{cost.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground mb-1">Sale Price</p>
                    <p className="text-xl font-black text-secondary">₹{recipe.basePrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="w-full py-5 bg-muted/20 dark:bg-white/5 group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-inner">
                View Architecture Details
                <ChevronRight size={18} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Recipe Inspector (Side Detail Panel) ───────────────── */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-[60] flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedRecipe(null)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0f1117] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            {/* Header */}
            <div className="p-10 pb-6 border-b border-muted dark:border-white/5">
              <div className="flex items-center justify-between mb-8">
                <button 
                  onClick={() => setSelectedRecipe(null)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all"
                >
                  <ArrowLeft size={14} /> Back to Library
                </button>
                <div className="flex items-center gap-2">
                  <button className="p-3 rounded-2xl bg-muted/20 dark:bg-white/5 text-muted-foreground hover:bg-primary hover:text-white transition-all">
                    <Settings2 size={20} />
                  </button>
                  <button className="p-3 rounded-2xl bg-muted/20 dark:bg-white/5 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/20 px-3 py-1.5 rounded-lg mb-4 inline-block">
                    {selectedRecipe.category}
                  </span>
                  <h2 className="text-4xl font-black tracking-tighter text-foreground">{selectedRecipe.name}</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium italic">{selectedRecipe.description}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-6">
                {[
                  { icon: Clock, label: "Total Time", value: `${selectedRecipe.prepTime}m` },
                  { icon: User, label: "Std Portions", value: selectedRecipe.servings },
                  { icon: Zap, label: "Hard Level", value: selectedRecipe.difficulty },
                ].map((m, i) => (
                  <div key={i} className="bg-muted/10 dark:bg-white/5 rounded-3xl p-5 border border-muted dark:border-white/5">
                    <m.icon size={18} className="text-primary mb-2" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{m.label}</p>
                    <p className="text-lg font-black text-foreground">{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Portion Scaling */}
              <div className="bg-[#F58220]/5 border border-[#F58220]/10 rounded-[32px] p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-lg font-black text-[#F58220]">Portion Scaler</h4>
                    <p className="text-[10px] font-bold text-[#F58220]/60 uppercase tracking-widest">Dynamic Inventory Requirement</p>
                  </div>
                  <div className="flex items-center gap-4 bg-white dark:bg-black/20 rounded-2xl p-2 border border-[#F58220]/20">
                    <button 
                      onClick={() => setScalePortions(p => Math.max(1, p - 1))}
                      className="w-10 h-10 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-600 transition-all font-black"
                    >-</button>
                    <span className="text-xl font-black px-2">{scalePortions}</span>
                    <button 
                      onClick={() => setScalePortions(p => p + 1)}
                      className="w-10 h-10 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-600 transition-all font-black"
                    >+</button>
                  </div>
                </div>
                <div className="space-y-3">
                  {selectedRecipe.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-white/40 dark:bg-white/5 px-5 py-3 rounded-2xl">
                      <span className="text-sm font-bold text-foreground">{item.name}</span>
                      <span className="font-black text-primary">
                        {(item.quantity * scalePortions).toLocaleString()} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preparation Steps */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Play size={20} className="text-emerald-500" />
                  <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Production Sequence</h3>
                </div>
                <div className="space-y-4">
                  {selectedRecipe.steps?.length > 0 ? selectedRecipe.steps.map((step: string, idx: number) => (
                    <div key={idx} className="flex gap-6 group">
                      <div className="w-8 h-8 rounded-full bg-muted/20 dark:bg-white/10 flex items-center justify-center shrink-0 border border-muted dark:border-white/5 font-black text-[10px] group-hover:bg-primary group-hover:text-white transition-all">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed pt-1">
                        {step}
                      </p>
                    </div>
                  )) : (
                    <div className="p-8 border-2 border-dashed border-muted rounded-3xl text-center text-muted-foreground opacity-50 italic">
                      No preparation steps recorded for this architecture.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-10 border-t border-muted dark:border-white/5 bg-slate-50 dark:bg-transparent">
              <div className="flex gap-4">
                <button 
                  className="flex-1 py-5 bg-white dark:bg-white/5 border border-muted dark:border-white/10 text-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-muted/50 transition-all"
                >
                  Generate Production Plan
                </button>
                <button 
                  className="flex-1 py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Print Architecture (SOP)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setShowBuilder(false)} />
          <div className="relative bg-white dark:bg-card rounded-[48px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20 dark:border-white/5">
            <div className="p-10 pb-6 flex items-center justify-between border-b border-muted dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                  <ChefHat size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-foreground">Recipe Orchestrator</h2>
                  <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">PRODUCTION DESIGN MANAGER</p>
                </div>
              </div>
              <button 
                onClick={() => setShowBuilder(false)}
                className="p-3 rounded-2xl hover:bg-muted dark:hover:bg-white/10 text-muted-foreground transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveRecipe} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Dish Identity</label>
                    <input 
                      required 
                      placeholder="e.g. Signature Chicken Biryani"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-muted/20 dark:bg-white/5 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-black/20 rounded-3xl py-5 px-8 outline-none font-black text-xl transition-all placeholder:font-normal placeholder:opacity-50"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Prep Time (Min)</label>
                      <input 
                        type="number"
                        value={formData.prepTime}
                        onChange={e => setFormData({...formData, prepTime: Number(e.target.value)})}
                        className="w-full bg-muted/20 dark:bg-white/5 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-black/20 rounded-2xl py-4 px-6 outline-none font-black text-sm transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Servings</label>
                      <input 
                        type="number"
                        value={formData.servings}
                        onChange={e => setFormData({...formData, servings: Number(e.target.value)})}
                        className="w-full bg-muted/20 dark:bg-white/5 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-black/20 rounded-2xl py-4 px-6 outline-none font-black text-sm transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Difficulty</label>
                      <select 
                        value={formData.difficulty}
                        onChange={e => setFormData({...formData, difficulty: e.target.value as any})}
                        className="w-full bg-muted/20 dark:bg-white/5 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-black/20 rounded-2xl py-4 px-6 outline-none font-black text-xs appearance-none cursor-pointer"
                      >
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Composition Description</label>
                    <textarea 
                      rows={3}
                      placeholder="Explain the dish and preparation requirements..."
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-muted/20 dark:bg-white/5 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-black/20 rounded-3xl py-5 px-8 outline-none font-bold transition-all resize-none italic"
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-muted/20 dark:bg-white/5 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-black/20 rounded-3xl py-5 px-8 outline-none font-black text-xs appearance-none cursor-pointer"
                    >
                      <option>Starter</option>
                      <option>Main Course</option>
                      <option>Beverage</option>
                      <option>Dessert</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Base Sale Price</label>
                    <div className="relative">
                       <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black text-xl">₹</span>
                       <input 
                        type="number" 
                        step="0.01" 
                        required
                        value={formData.basePrice}
                        onChange={e => setFormData({...formData, basePrice: Number(e.target.value)})}
                        className="w-full bg-muted/20 dark:bg-white/5 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-black/20 rounded-3xl py-5 pl-12 pr-8 outline-none font-black text-xl transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-10 border-t border-muted/50 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-foreground">Ingredient Architecture</h3>
                    <p className="text-xs text-muted-foreground font-medium italic underline decoration-primary/20">Map current inventory items to this recipe.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={handleAddIngredient}
                    className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-secondary/20"
                  >
                    <Plus size={16} />
                    ADD INGREDIENT
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.items.length === 0 ? (
                    <div className="py-12 bg-muted/10 dark:bg-white/5 rounded-[40px] border-2 border-dashed border-muted/50 dark:border-white/10 flex flex-col items-center justify-center text-muted-foreground gap-3">
                      <Layers size={32} className="opacity-30" />
                      <p className="font-bold opacity-50">No ingredients defined yet.</p>
                    </div>
                  ) : formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-center bg-muted/10 dark:bg-white/5 p-4 rounded-3xl group animate-in slide-in-from-left-4 border border-transparent dark:hover:border-white/10 transition-all shadow-sm">
                      <div className="col-span-5">
                        <select 
                          required
                          value={item.ingredientId}
                          onChange={e => handleIngredientChange(index, 'ingredientId', e.target.value)}
                          className="w-full bg-white dark:bg-card border border-muted/50 dark:border-white/10 rounded-2xl py-4 px-6 outline-none font-bold text-sm shadow-sm"
                        >
                          <option value="">Select Raw Material / SKU...</option>
                          {inventory.map(inv => (
                            <option key={inv.id} value={inv.sku}>{inv.name} ({inv.sku})</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3 h-full">
                         <input 
                          type="number" 
                          step="0.01"
                          required
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={e => handleIngredientChange(index, 'quantity', Number(e.target.value))}
                          className="w-full h-full bg-white dark:bg-card border border-muted/50 dark:border-white/10 rounded-2xl py-4 px-6 outline-none font-black text-center shadow-sm"
                        />
                      </div>
                      <div className="col-span-2">
                         <select 
                          value={item.unit}
                          onChange={e => handleIngredientChange(index, 'unit', e.target.value)}
                          className="w-full bg-white dark:bg-card border border-muted/50 dark:border-white/10 rounded-2xl py-4 px-2 outline-none font-black text-center text-xs shadow-sm appearance-none"
                        >
                          <option value="g">g</option>
                          <option value="kg">kg</option>
                          <option value="ml">ml</option>
                          <option value="l">l</option>
                          <option value="pcs">pcs</option>
                        </select>
                      </div>
                      <div className="col-span-2 text-right">
                        <button 
                          type="button"
                          onClick={() => handleRemoveIngredient(index)}
                          className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all"
                        >
                          <Trash size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preparation Strategy (Steps) */}
              <div className="space-y-6 pt-10 border-t border-muted/50 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-foreground">Production Sequence</h3>
                    <p className="text-xs text-muted-foreground font-medium italic underline decoration-secondary/20">Define the step-by-step Standard Operating Procedure.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, steps: [...formData.steps, ""]})}
                    className="flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/20"
                  >
                    <Plus size={16} />
                    ADD STEP
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-4 items-start group">
                      <div className="w-10 h-10 rounded-xl bg-muted/20 dark:bg-white/5 flex items-center justify-center shrink-0 font-black text-xs border border-muted dark:border-white/5 group-hover:border-primary/30 transition-all">
                        {idx + 1}
                      </div>
                      <textarea 
                        required
                        placeholder={`Describe step ${idx + 1}...`}
                        value={step}
                        onChange={e => {
                          const newSteps = [...formData.steps];
                          newSteps[idx] = e.target.value;
                          setFormData({...formData, steps: newSteps});
                        }}
                        className="flex-1 bg-muted/10 dark:bg-white/5 border border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-black/20 rounded-2xl py-3 px-5 outline-none font-medium italic text-sm transition-all resize-none shadow-sm"
                        rows={2}
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const newSteps = [...formData.steps];
                          newSteps.splice(idx, 1);
                          setFormData({...formData, steps: newSteps});
                        }}
                        className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  ))}
                  {formData.steps.length === 0 && (
                    <div className="py-8 bg-muted/5 dark:bg-white/5 rounded-3xl border-2 border-dashed border-muted flex flex-col items-center justify-center text-muted-foreground opacity-50 italic text-sm">
                      Click 'Add Step' to define the sequence.
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Dashboard */}
              <div className="p-8 bg-slate-900 dark:bg-black/40 rounded-[40px] border border-white/10 shadow-2xl">
                <div className="grid grid-cols-3 gap-12 text-center">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 underline decoration-primary/40 underline-offset-4">Calculated Cost</p>
                    <p className="text-4xl font-black text-white tracking-tighter">₹{calculateFoodCost(formData.items).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 underline decoration-secondary/40 underline-offset-4">Target Price</p>
                    <p className="text-4xl font-black text-secondary tracking-tighter">₹{formData.basePrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 underline decoration-emerald-400/40 underline-offset-4">Est. Margin</p>
                    <p className="text-4xl font-black text-emerald-400 tracking-tighter">
                      {formData.basePrice > 0 
                        ? ((((formData.basePrice - calculateFoodCost(formData.items)) / formData.basePrice) * 100).toFixed(1))
                        : "0.0"}%
                    </p>
                  </div>
                </div>
              </div>

              
              <div className="pt-10 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowBuilder(false)}
                  className="flex-1 py-6 bg-muted dark:bg-white/5 text-foreground rounded-[32px] font-black uppercase tracking-widest hover:bg-muted/80 dark:hover:bg-white/10 transition-all border border-muted dark:border-white/5"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-6 bg-primary text-white rounded-[32px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/30"
                >
                  Finalize & Sync Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
