import { useState, useRef, useEffect } from 'react';

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
        <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => inputValue && setIsOpen(true)}
                    placeholder={placeholder || "Enter city"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-600 focus:border-transparent outline-none transition"
                />

                {isOpen && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                        {suggestions.map((city) => (
                            <button
                                key={city}
                                onClick={() => handleSelectCity(city)}
                                className="w-full text-left px-4 py-2 hover:bg-sky-50 text-gray-800 transition-colors"
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CitySearchInput;
