import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Search } from 'lucide-react';

const CITIES = [
    "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot",
    "Gujranwala", "Hyderabad", "Bahawalpur", "Sargodha", "Abbottabad", "Sukkur", "Mardan", "Sheikhupura",
    "Rahim Yar Khan", "Gujrat", "Sahiwal", "Wah Cantonment", "Dera Ghazi Khan", "Kasur", "Okara", "Chiniot",
    "Larkana", "Nawabshah", "Mirpur Khas"
].sort();

interface CitySearchInputProps {
    label: string;
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
}

const CitySearchInput = ({ label, placeholder, value, onChange }: CitySearchInputProps) => {
    const [inputValue, setInputValue] = useState(value || '');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setInputValue(query);
        onChange?.(query);

        if (query.length > 0) {
            const filtered = CITIES.filter(city =>
                city.toLowerCase().startsWith(query.toLowerCase())
            );
            setSuggestions(filtered);
            setIsOpen(true);
        } else {
            setSuggestions([]);
            setIsOpen(false);
        }
    };

    const handleSelectCity = (city: string) => {
        setInputValue(city);
        onChange?.(city);
        setIsOpen(false);
    };

    return (
        <div className="relative group" ref={wrapperRef}>
            <label className="block text-[10px] text-[#aa8453] tracking-[0.4em] uppercase font-condensed mb-3 ml-1">
                {label}
            </label>
            <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#aa8453]/60 group-focus-within:text-[#aa8453] transition-colors">
                    <MapPin size={18} strokeWidth={1.5} />
                </div>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => inputValue && setIsOpen(true)}
                    placeholder={placeholder || "Enter city"}
                    className="w-full pl-14 pr-12 py-5 bg-white border-b border-gray-100 group-focus-within:border-[#aa8453] outline-none transition-all duration-500 font-serif text-lg text-gray-800 placeholder:text-gray-300 placeholder:font-light"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#aa8453] transition-colors">
                    <Search size={16} strokeWidth={1.5} />
                </div>

                {isOpen && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white shadow-2xl border border-gray-50 max-h-72 overflow-y-auto rounded-none animate-in fade-in slide-in-from-top-2 duration-300">
                        {suggestions.map((city) => (
                            <button
                                key={city}
                                onClick={() => handleSelectCity(city)}
                                className="w-full text-left px-6 py-4 hover:bg-[#fcfbf9] hover:text-[#aa8453] text-gray-700 font-serif transition-all duration-300 flex items-center justify-between group/item border-b border-gray-50 last:border-0"
                            >
                                <span>{city}</span>
                                <ChevronDown size={14} className="-rotate-90 opacity-0 group-hover/item:opacity-100 transition-all transform translate-x-2 group-hover/item:translate-x-0" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CitySearchInput;
