import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { recipes as staticRecipes } from '../data/recipes';
import { Recipe, Step } from '../types';
import { useFavorites } from '../contexts/FavoritesContext';
import { getChefsTip, getIngredientSubstitute, updateRecipeWithIngredients, translateRecipe, generateImageForRecipe, updateRecipeForCooktop } from '../services/geminiService';
import { 
  HeartIcon, ClockIcon, TimerIcon, PlayIcon, PauseIcon, ResetIcon, 
  ChevronUpIcon, ChevronDownIcon, LightbulbIcon, ReplaceIcon, XIcon, MagicWandIcon,
  LanguageIcon, SpinnerIcon, CooktopIcon,
} from '../components/icons/Icons';

const StepTimer: React.FC<{ step: Step, onComplete: () => void }> = ({ step, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(step.time);
  const [isActive, setIsActive] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setTimeLeft(step.time);
    setIsActive(false);
  }, [step]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      onCompleteRef.current();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(step.time);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="mt-2 flex items-center gap-4 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
      <TimerIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
      <span className="text-lg font-mono font-semibold text-gray-800 dark:text-gray-200 w-20">{formatTime(timeLeft)}</span>
      <div className="flex items-center gap-2">
        <button onClick={toggleTimer} className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/80 transition">
          {isActive ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
        </button>
        <button onClick={resetTimer} className="p-2 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition">
          <ResetIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

const ChefTip: React.FC<{ recipeName: string, stepDescription: string }> = ({ recipeName, stepDescription }) => {
    const [tip, setTip] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchTip = async () => {
        setIsLoading(true);
        setError('');
        setTip('');
        try {
            const result = await getChefsTip(recipeName, stepDescription);
            setTip(result);
        } catch (err) {
            setError('Could not fetch a tip. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="mt-4">
            {!tip && !isLoading && (
                 <button 
                    onClick={fetchTip}
                    className="inline-flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 font-semibold"
                >
                    <LightbulbIcon className="h-4 w-4" />
                    Get a Chef's Tip
                </button>
            )}
            {isLoading && <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Getting a tip from our AI chef...</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
            {tip && (
                <div className="p-3 bg-amber-50 dark:bg-gray-700 border-l-4 border-amber-400 dark:border-amber-600 text-amber-800 dark:text-amber-200 rounded-r-lg">
                    <p className="font-bold text-sm">Chef's Tip:</p>
                    <p className="text-sm">{tip}</p>
                </div>
            )}
        </div>
    );
};

export const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const stateRecipe = location.state?.recipe as Recipe | undefined;
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const cooktopDropdownRef = useRef<HTMLDivElement>(null);

  const [activeStep, setActiveStep] = useState<number | null>(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [substituteIngredient, setSubstituteIngredient] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<{ substitute: string; explanation: string; } | null>(null);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState('');

  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [isUpdatingRecipe, setIsUpdatingRecipe] = useState(false);
  const [recipeUpdateError, setRecipeUpdateError] = useState<string | null>(null);
  const [isRecipeModified, setIsRecipeModified] = useState(false);

  // Translation State
  const [language, setLanguage] = useState<'English' | 'Hindi' | 'Hinglish'>('English');
  const [translation, setTranslation] = useState<{ name: string; description: string; ingredients: string[]; steps: Step[] } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Image Generation State
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageGenerationError, setImageGenerationError] = useState<string | null>(null);
  
  // Cooktop State
  const [cooktop, setCooktop] = useState<'LPG Cooktop' | 'Induction Cooktop' | 'Simple Electric Kettle'>('LPG Cooktop');
  const [isCooktopDropdownOpen, setIsCooktopDropdownOpen] = useState(false);
  const [isUpdatingCooktop, setIsUpdatingCooktop] = useState(false);
  const [cooktopUpdateError, setCooktopUpdateError] = useState<string | null>(null);
  const [isCooktopModified, setIsCooktopModified] = useState(false);
  const [stepsBeforeCooktopMod, setStepsBeforeCooktopMod] = useState<Step[] | null>(null);

  // Timer End Popup State
  const [isTimerEndPopupVisible, setIsTimerEndPopupVisible] = useState(false);


  const recipe = useMemo(() => { // This is the original, unmodified recipe
    if (stateRecipe && stateRecipe.id === id) {
      return stateRecipe;
    }
    return staticRecipes.find(r => r.id === id);
  }, [id, stateRecipe]);

  useEffect(() => {
    if (recipe) {
      setCurrentRecipe(recipe);
      setIsRecipeModified(false);
      const initialCheckedState = recipe.ingredients.reduce((acc, ing) => {
        acc[ing] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setCheckedIngredients(initialCheckedState);
      setCompletedSteps(new Set());
    }
  }, [recipe]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
      if (cooktopDropdownRef.current && !cooktopDropdownRef.current.contains(event.target as Node)) {
        setIsCooktopDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  
  const handleLanguageChange = async (newLang: 'English' | 'Hindi' | 'Hinglish') => {
    setIsLangDropdownOpen(false);
    if (newLang === language) return;

    setLanguage(newLang);

    if (newLang === 'English') {
      setTranslation(null);
      setTranslationError(null);
      return;
    }

    if (!currentRecipe) return;

    setIsTranslating(true);
    setTranslationError(null);
    setTranslation(null);

    try {
      const result = await translateRecipe(currentRecipe, newLang);
      if (result) {
        setTranslation(result);
      } else {
        setTranslationError(`Sorry, the AI couldn't translate the recipe. Please try again.`);
        setLanguage('English'); // Revert on failure
      }
    } catch (err) {
      setTranslationError("An error occurred during translation.");
      setLanguage('English'); // Revert on failure
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCooktopChange = async (newCooktop: 'LPG Cooktop' | 'Induction Cooktop' | 'Simple Electric Kettle') => {
    setIsCooktopDropdownOpen(false);
    if (newCooktop === cooktop || !currentRecipe) return;

    setCompletedSteps(new Set()); // Reset completion on change

    if (newCooktop === 'LPG Cooktop') {
        if (stepsBeforeCooktopMod) {
            setCurrentRecipe(prev => prev ? { ...prev, steps: stepsBeforeCooktopMod } : null);
        }
        setIsCooktopModified(false);
        setStepsBeforeCooktopMod(null);
        setCooktop('LPG Cooktop');
        setCooktopUpdateError(null);
        return;
    }

    const previousCooktop = cooktop;
    setCooktop(newCooktop);
    setIsUpdatingCooktop(true);
    setCooktopUpdateError(null);
    
    try {
        const baseRecipeForMod = { ...currentRecipe };
        if (stepsBeforeCooktopMod) {
            baseRecipeForMod.steps = stepsBeforeCooktopMod;
        }

        if (!isCooktopModified) {
            setStepsBeforeCooktopMod(currentRecipe.steps);
        }
        
        const result = await updateRecipeForCooktop(baseRecipeForMod, newCooktop);

        if (result) {
            setCurrentRecipe(prev => prev ? { ...prev, steps: result.steps } : null);
            setIsCooktopModified(true);
        } else {
            setCooktopUpdateError(`Sorry, the AI couldn't adapt the recipe. Please try again.`);
            setCooktop(previousCooktop); // Revert selection on failure
        }
    } catch (err) {
        setCooktopUpdateError("An error occurred during adaptation. Please try again.");
        setCooktop(previousCooktop); // Revert selection on failure
    } finally {
        setIsUpdatingCooktop(false);
    }
  };

  const handleUpdateRecipe = async () => {
    if (!currentRecipe) return;

    setIsUpdatingRecipe(true);
    setRecipeUpdateError(null);
    setCompletedSteps(new Set()); // Reset completion on change

    const availableIngredients = Object.entries(checkedIngredients)
      .filter(([, isChecked]) => isChecked)
      .map(([ingredient]) => ingredient);
      
    try {
      const updatedData = await updateRecipeWithIngredients(
        currentRecipe.name,
        currentRecipe.ingredients,
        availableIngredients,
        currentRecipe.steps
      );

      if (updatedData) {
        setCurrentRecipe(prev => prev ? { ...prev, steps: updatedData.steps, ingredients: updatedData.ingredients } : null);
        setIsRecipeModified(true);
      } else {
        setRecipeUpdateError("Sorry, the AI couldn't update the recipe. Please try again.");
      }
    } catch (error) {
      setRecipeUpdateError("An error occurred while updating the recipe.");
    } finally {
      setIsUpdatingRecipe(false);
    }
  };

  const handleResetRecipe = () => {
    if (recipe) {
      setCurrentRecipe(recipe);
      setIsRecipeModified(false);
      setLanguage('English');
      setTranslation(null);
      setTranslationError(null);
      setCooktop('LPG Cooktop');
      setIsCooktopModified(false);
      setStepsBeforeCooktopMod(null);
      setCooktopUpdateError(null);
      setCompletedSteps(new Set());
      const initialCheckedState = recipe.ingredients.reduce((acc, ing) => {
        acc[ing] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setCheckedIngredients(initialCheckedState);
    }
  };
  
  const handleGenerateImage = async () => {
    if (!currentRecipe) return;
    setIsGeneratingImage(true);
    setImageGenerationError(null);
    try {
      const newImageUrl = await generateImageForRecipe(currentRecipe.name, currentRecipe.description);
      if (newImageUrl) {
        const updatedRecipe = { ...currentRecipe, imageUrl: newImageUrl };
        setCurrentRecipe(updatedRecipe);
        // If the recipe is a favorite, update it in the favorites list
        if (isFavorite(currentRecipe.id)) {
           await addFavorite(updatedRecipe); // Using upsert logic
        }
      } else {
        setImageGenerationError("Sorry, the AI couldn't generate an image. Please try again.");
      }
    } catch (error) {
      setImageGenerationError("An error occurred while generating the image.");
    } finally {
      setIsGeneratingImage(false);
    }
  };
  
  if (!currentRecipe) {
    if (!recipe) { // The original logic for not found
      return (
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold">Recipe not found</h1>
          <p className="mt-4">Sorry, we couldn't find the recipe you're looking for.</p>
          <Link to="/" className="mt-6 inline-block bg-emerald-600 text-white font-bold py-2 px-4 rounded hover:bg-emerald-700">
            Back to Home
          </Link>
        </div>
      );
    }
    return null; // Or a loading spinner
  }
  
  const favorite = isFavorite(currentRecipe.id);
  const handleFavoriteClick = () => {
    if (favorite) {
      removeFavorite(currentRecipe.id);
    } else {
      addFavorite(currentRecipe);
    }
  };

  const toggleStep = (index: number) => {
    setActiveStep(activeStep === index ? null : index);
  };
  
  const handleStepCompletionToggle = (index: number) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleTimerFinish = () => {
    // Show popup only if there is a next step
    if(activeStep !== null && activeStep < currentRecipe.steps.length - 1) {
        setIsTimerEndPopupVisible(true);
    }
  };
  
  const handleGoToNextStep = () => {
    if (activeStep !== null && activeStep < currentRecipe.steps.length - 1) {
      // Mark current step as complete
      setCompletedSteps(prev => new Set(prev).add(activeStep));
      // Move to next step
      setActiveStep(activeStep + 1);
    }
    setIsTimerEndPopupVisible(false);
  };


  const handleCheckChange = (ingredient: string) => {
    setCheckedIngredients(prev => ({ ...prev, [ingredient]: !prev[ingredient] }));
  };
  
  const handleGetSubstitute = async (ingredient: string) => {
    setSubstituteIngredient(ingredient);
    setIsModalOpen(true);
    setIsSuggestionLoading(true);
    setSuggestion(null);
    setSuggestionError('');
    try {
      const result = await getIngredientSubstitute(currentRecipe.name, currentRecipe.ingredients, ingredient);
      setSuggestion(result);
      if(!result) {
        setSuggestionError("Sorry, the AI couldn't find a substitute for this ingredient.");
      }
    } catch (err) {
      setSuggestionError("Could not fetch a suggestion. Please try again.");
    } finally {
      setIsSuggestionLoading(false);
    }
  };
  
  const handleApplySubstitute = () => {
    if (!substituteIngredient || !suggestion || !suggestion.substitute || !currentRecipe) return;

    const oldIngredient = substituteIngredient;
    const newIngredient = suggestion.substitute;

    const newIngredients = currentRecipe.ingredients.map(ing =>
      ing === oldIngredient ? newIngredient : ing
    );
    
    setCurrentRecipe(prev => prev ? { ...prev, ingredients: newIngredients } : null);

    setCheckedIngredients(prev => {
      const newState = { ...prev };
      delete newState[oldIngredient];
      newState[newIngredient] = true;
      return newState;
    });

    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSubstituteIngredient(null);
  };

  const totalTime = currentRecipe.prepTime + currentRecipe.cookTime;
  const hasUncheckedIngredients = Object.values(checkedIngredients).some(isChecked => !isChecked);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {currentRecipe.imageUrl && (
          <img className="w-full h-64 md:h-96 object-cover" src={currentRecipe.imageUrl} alt={currentRecipe.name} />
        )}

        <div className="p-6 md:p-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase">{currentRecipe.category}</p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100 mt-1">
                {(language !== 'English' && translation) ? translation.name : currentRecipe.name}
              </h1>
              {currentRecipe.isGenerated && <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold mt-2">✨ This recipe was generated by AI!</p>}
            </div>
             <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              {currentRecipe.isGenerated && !currentRecipe.imageUrl && (
                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage}
                  className="bg-white/80 dark:bg-gray-900/80 rounded-full p-3 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-md disabled:opacity-50 disabled:cursor-wait"
                  aria-label="Generate AI Image"
                  title="Generate AI Image"
                >
                  {isGeneratingImage ? <SpinnerIcon className="h-7 w-7" /> : <MagicWandIcon className="h-7 w-7" />}
                </button>
              )}
               <div className="relative" ref={cooktopDropdownRef}>
                <button
                  onClick={() => setIsCooktopDropdownOpen(!isCooktopDropdownOpen)}
                  disabled={isUpdatingCooktop}
                  className="bg-white/80 dark:bg-gray-900/80 rounded-full p-3 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-md disabled:opacity-50"
                  aria-label="Select cooktop"
                  title="Select cooktop"
                >
                  {isUpdatingCooktop ? <SpinnerIcon className="h-7 w-7" /> : <CooktopIcon className="h-7 w-7" />}
                </button>
                {isCooktopDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in">
                    <div className="py-1">
                      <button onClick={() => handleCooktopChange('LPG Cooktop')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">LPG Cooktop</button>
                      <button onClick={() => handleCooktopChange('Induction Cooktop')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Induction Cooktop</button>
                      <button onClick={() => handleCooktopChange('Simple Electric Kettle')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Simple Electric Kettle</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative" ref={langDropdownRef}>
                <button
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  disabled={isTranslating}
                  className="bg-white/80 dark:bg-gray-900/80 rounded-full p-3 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-md disabled:opacity-50"
                  aria-label="Select language"
                >
                  {isTranslating ? <SpinnerIcon className="h-7 w-7" /> : <LanguageIcon className="h-7 w-7" />}
                </button>
                {isLangDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-32 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in">
                    <div className="py-1">
                      <button onClick={() => handleLanguageChange('English')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">English</button>
                      <button onClick={() => handleLanguageChange('Hinglish')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Hinglish</button>
                      <button onClick={() => handleLanguageChange('Hindi')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Hindi</button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleFavoriteClick}
                className="flex-shrink-0 bg-white/80 dark:bg-gray-900/80 rounded-full p-3 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors shadow-md"
                aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <HeartIcon className={`h-7 w-7 ${favorite ? 'text-red-500 fill-current' : ''}`} />
              </button>
            </div>
          </div>
          
          {translationError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-gray-700 border-l-4 border-red-400 dark:border-red-600 text-red-800 dark:text-red-200 rounded-r-lg animate-fade-in">
              <p className="font-bold text-sm">Translation Error:</p>
              <p className="text-sm">{translationError}</p>
            </div>
          )}
          
          {imageGenerationError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-gray-700 border-l-4 border-red-400 dark:border-red-600 text-red-800 dark:text-red-200 rounded-r-lg animate-fade-in">
              <p className="font-bold text-sm">Image Generation Error:</p>
              <p className="text-sm">{imageGenerationError}</p>
            </div>
          )}

          {cooktopUpdateError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-gray-700 border-l-4 border-red-400 dark:border-red-600 text-red-800 dark:text-red-200 rounded-r-lg animate-fade-in">
              <p className="font-bold text-sm">Cooktop Adaptation Error:</p>
              <p className="text-sm">{cooktopUpdateError}</p>
            </div>
          )}

          <p className="text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
            {(language !== 'English' && translation) ? translation.description : currentRecipe.description}
          </p>
          
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-500 dark:text-gray-400">
             <div className="flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              <span><strong>Total:</strong> {totalTime} min</span>
            </div>
             <div className="flex items-center">
              <span><strong>Prep:</strong> {currentRecipe.prepTime} min</span>
            </div>
             <div className="flex items-center">
              <span><strong>Cook:</strong> {currentRecipe.cookTime} min</span>
            </div>
             <div className="flex items-center">
              <span><strong>Servings:</strong> {currentRecipe.servings}</span>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h2 className="text-2xl font-bold border-b-2 border-emerald-200 dark:border-emerald-800 pb-2 mb-4">Ingredients</h2>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                {currentRecipe.ingredients.map((originalIng, index) => {
                  const displayIng = (language !== 'English' && translation?.ingredients?.[index]) ? translation.ingredients[index] : originalIng;
                  return (
                    <li key={`${originalIng}-${index}`} className="flex items-start justify-between group">
                      <label className="flex items-start cursor-pointer flex-grow mr-2">
                        <input
                          type="checkbox"
                          checked={checkedIngredients[originalIng] !== false}
                          onChange={() => handleCheckChange(originalIng)}
                          className="mt-1 h-5 w-5 rounded border-gray-300 dark:border-gray-500 text-emerald-600 focus:ring-emerald-500 flex-shrink-0"
                          disabled={isRecipeModified}
                        />
                        <span className={`ml-3 ${checkedIngredients[originalIng] === false ? 'line-through text-gray-400 dark:text-gray-500' : ''} ${isRecipeModified ? 'text-gray-500' : ''}`}>
                          {displayIng}
                        </span>
                      </label>
                      {checkedIngredients[originalIng] === false && !isRecipeModified && (
                         <button
                          onClick={() => handleGetSubstitute(originalIng)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 flex-shrink-0"
                          title="Get substitute"
                        >
                          <ReplaceIcon className="h-5 w-5" />
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
               {hasUncheckedIngredients && !isRecipeModified && (
                <div className="mt-6">
                  <button 
                    onClick={handleUpdateRecipe} 
                    disabled={isUpdatingRecipe}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition disabled:bg-emerald-300">
                    <MagicWandIcon className="h-5 w-5"/>
                    {isUpdatingRecipe ? "Updating Recipe..." : "Update Recipe with My Ingredients"}
                  </button>
                  {isUpdatingRecipe && <p className="text-sm text-center mt-2 animate-pulse">Our AI chef is personalizing your recipe...</p>}
                  {recipeUpdateError && <p className="text-red-500 text-sm mt-2">{recipeUpdateError}</p>}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold border-b-2 border-emerald-200 dark:border-emerald-800 pb-2 flex-grow">Instructions</h2>
                  {(isRecipeModified || isCooktopModified) && (
                    <button onClick={handleResetRecipe} className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-semibold ml-4 flex-shrink-0">
                      <ResetIcon className="h-4 w-4" />
                      Reset to Original
                    </button>
                  )}
                </div>

                {isRecipeModified && (
                  <div className="p-3 mb-4 bg-emerald-50 dark:bg-gray-700 border-l-4 border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-200 rounded-r-lg animate-fade-in">
                    <p className="font-bold text-sm">Recipe Updated!</p>
                    <p className="text-sm">The instructions have been adjusted for your available ingredients.</p>
                  </div>
                )}
                {isCooktopModified && (
                  <div className="p-3 mb-4 bg-blue-50 dark:bg-gray-700 border-l-4 border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-200 rounded-r-lg animate-fade-in">
                    <p className="font-bold text-sm">Recipe Adapted!</p>
                    <p className="text-sm">The instructions have been adjusted for your <strong>{cooktop}</strong>.</p>
                  </div>
                )}

              <div className="space-y-4">
                {currentRecipe.steps.map((step, index) => {
                  const isCompleted = completedSteps.has(index);
                  const displayStepDescription = (language !== 'English' && translation?.steps?.[index]) 
                    ? translation.steps[index].description 
                    : step.description;
                  const displayRecipeName = (language !== 'English' && translation) 
                    ? translation.name 
                    : currentRecipe.name;
                  
                  return (
                    <div key={index} className={`border dark:border-gray-700 rounded-lg overflow-hidden transition-colors ${isCompleted ? 'bg-green-50/50 dark:bg-gray-800' : 'bg-white dark:bg-gray-800'}`}>
                      <div
                        onClick={() => toggleStep(index)}
                        className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                         <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`step-checkbox-${index}`}
                              checked={isCompleted}
                              onChange={() => handleStepCompletionToggle(index)}
                              onClick={(e) => e.stopPropagation()} // Prevent accordion from toggling when clicking checkbox
                              className="h-6 w-6 rounded border-gray-400 dark:border-gray-500 text-emerald-600 focus:ring-emerald-500 bg-transparent dark:bg-gray-800"
                            />
                            <span className={`font-bold text-lg text-left ml-4 ${isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                              Step {index + 1}
                            </span>
                          </div>
                        {activeStep === index ? <ChevronUpIcon className="h-6 w-6"/> : <ChevronDownIcon className="h-6 w-6"/>}
                      </div>
                      {activeStep === index && (
                        <div className="p-4 bg-white dark:bg-gray-800 animate-fade-in">
                          <p className="text-gray-700 dark:text-gray-300">{displayStepDescription}</p>
                          {step.time > 0 && (
                            <StepTimer step={step} onComplete={handleTimerFinish} />
                          )}
                          <ChefTip recipeName={displayRecipeName} stepDescription={displayStepDescription} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
       {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative animate-slide-in-up" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full">
              <XIcon className="h-6 w-6" />
            </button>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Substitution for:</h3>
            <p className="font-semibold text-emerald-700 dark:text-emerald-400 mb-4">{substituteIngredient}</p>
            {isSuggestionLoading && <p className="text-gray-600 dark:text-gray-300 animate-pulse">Our AI chef is thinking...</p>}
            {suggestionError && <p className="text-red-500">{suggestionError}</p>}
            {suggestion && (
                <>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">{suggestion.explanation}</p>
                    <div className="mt-4 p-3 bg-emerald-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">Suggested Substitute:</p>
                        <p className="font-semibold text-emerald-900 dark:text-emerald-100">{suggestion.substitute}</p>
                    </div>
                    <button
                        onClick={handleApplySubstitute}
                        className="mt-6 w-full px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition"
                    >
                        Use this substitute
                    </button>
                </>
            )}
          </div>
        </div>
      )}
      {isTimerEndPopupVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-sm text-center relative animate-slide-in-up">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-4">Time's up!</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Ready for the next step?</p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                   <button
                      onClick={() => setIsTimerEndPopupVisible(false)}
                      className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                  >
                      Stay Here
                  </button>
                  <button
                      onClick={handleGoToNextStep}
                      className="w-full px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition"
                  >
                      Go to Next Step
                  </button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};
