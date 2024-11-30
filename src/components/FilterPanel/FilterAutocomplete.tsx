import { TextField, Autocomplete } from '@mui/material';

interface FilterAutocompleteProps {
  value: string | string[] | null;
  onChange: (value: string | string[] | null) => void;
  options: (string | null)[];
  label: string;
  placeholder?: string;
  freeSolo?: boolean;
  multiple?: boolean;
}

export function FilterAutocomplete({
  value,
  onChange,
  options,
  label,
  placeholder,
  freeSolo = false,
  multiple = false
}: FilterAutocompleteProps) {
  const filteredOptions = options.filter((option): option is string => option !== null);
  
  // Ensure value is in the correct format based on multiple prop
  const normalizedValue = multiple 
    ? (Array.isArray(value) ? value : value ? [value] : [])
    : (Array.isArray(value) ? value[0] : value);

  return (
    <Autocomplete
      value={normalizedValue}
      onChange={(_, newValue) => {
        // Ensure we always pass the correct type based on multiple prop
        onChange(multiple ? (newValue as string[]) : (newValue as string));
      }}
      options={filteredOptions}
      freeSolo={freeSolo}
      multiple={multiple}
      renderInput={(params) => (
        <TextField 
          {...params} 
          label={label}
          placeholder={placeholder}
          size="small"
          fullWidth
        />
      )}
      size="small"
      fullWidth
      isOptionEqualToValue={(option, value) => option === value}
      getOptionLabel={(option) => option || ''}
    />
  );
}