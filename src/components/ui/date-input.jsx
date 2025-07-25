import React, { useState, useEffect, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const DateInput = forwardRef(({
  value,
  onChange,
  placeholder = "JJ/MM/AAAA",
  disabled = false,
  error = false,
  className,
  ...props
}, ref) => {
  const [inputValue, setInputValue] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);

  // Convertir Date vers string DD/MM/AAAA
  const dateToString = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date)) return "";
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  };

  // Convertir string DD/MM/AAAA vers Date
  const stringToDate = (str) => {
    if (!str || typeof str !== 'string') return null;
    
    const parts = str.split('/');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    // Validation basique
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31) return null;
    if (month < 1 || month > 12) return null;
    if (year < 1900 || year > 2100) return null;
    
    const date = new Date(year, month - 1, day);
    
    // Vérifier que la date est valide (pas de 31 février, etc.)
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      return null;
    }
    
    return date;
  };

  // Initialiser inputValue avec la valeur prop
  useEffect(() => {
    if (value) {
      setInputValue(dateToString(value));
    } else {
      setInputValue("");
    }
  }, [value]);

  const formatInput = (input) => {
    // Supprimer tout ce qui n'est pas un chiffre
    const numbers = input.replace(/\D/g, '');
    
    // Limiter à 8 chiffres maximum (DDMMAAAA)
    const limitedNumbers = numbers.slice(0, 8);
    
    // Formater avec les slash
    let formatted = '';
    for (let i = 0; i < limitedNumbers.length; i++) {
      if (i === 2 || i === 4) {
        formatted += '/';
      }
      formatted += limitedNumbers[i];
    }
    
    return formatted;
  };

  const generateDisplayValue = (formattedValue) => {
    // Créer l'affichage avec les slash colorés
    const parts = formattedValue.split('/');
    let display = '';
    
    // Partie jour
    if (parts[0]) {
      display += parts[0];
      if (parts[0].length === 2) {
        display += '/'; // Slash noir
      } else if (formattedValue.length >= 2) {
        display += '/'; // Slash gris à noir
      }
    }
    
    // Partie mois
    if (parts[1]) {
      display += parts[1];
      if (parts[1].length === 2) {
        display += '/'; // Slash noir
      } else if (formattedValue.length >= 5) {
        display += '/'; // Slash gris à noir
      }
    }
    
    // Partie année
    if (parts[2]) {
      display += parts[2];
    }
    
    return display;
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    // Empêcher la suppression des slash
    if (newValue.length < inputValue.length) {
      const deletedChar = inputValue[cursorPos];
      if (deletedChar === '/') {
        // Ne pas permettre la suppression des slash
        return;
      }
    }
    
    const formatted = formatInput(newValue);
    setInputValue(formatted);
    
    // Gérer la conversion vers Date
    const dateValue = stringToDate(formatted);
    if (onChange) {
      onChange(dateValue);
    }
    
    // Gérer le positionnement du curseur
    setTimeout(() => {
      if (e.target) {
        let newCursorPos = cursorPos;
        
        // Si on a ajouté un slash automatiquement, déplacer le curseur après
        if (formatted.length > newValue.length) {
          newCursorPos = cursorPos + 1;
        }
        
        e.target.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyDown = (e) => {
    // Empêcher la suppression des slash avec Backspace
    if (e.key === 'Backspace') {
      const cursorPos = e.target.selectionStart;
      const charBefore = inputValue[cursorPos - 1];
      
      if (charBefore === '/') {
        e.preventDefault();
        // Supprimer le chiffre avant le slash
        if (cursorPos > 1) {
          const newValue = inputValue.slice(0, cursorPos - 2) + inputValue.slice(cursorPos);
          const formatted = formatInput(newValue);
          setInputValue(formatted);
          
          const dateValue = stringToDate(formatted);
          if (onChange) {
            onChange(dateValue);
          }
          
          setTimeout(() => {
            e.target.setSelectionRange(cursorPos - 2, cursorPos - 2);
          }, 0);
        }
      }
    }
  };

  // Fonction pour déterminer si une date est valide
  const isValidDate = (str) => {
    if (str.length !== 10) return false; // DD/MM/AAAA = 10 caractères
    return stringToDate(str) !== null;
  };

  return (
    <Input
      ref={ref}
      type="text"
      value={inputValue}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        "font-mono tracking-wider",
        error && "border-red-500 focus:border-red-500",
        !isValidDate(inputValue) && inputValue.length > 0 && "border-orange-400",
        className
      )}
      {...props}
    />
  );
});

DateInput.displayName = "DateInput";

export { DateInput };