function SearchInput({ value, onChange, placeholder = "Search..." }) {
  return (
    <input
      className="input w-full md:max-w-sm"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  );
}

export default SearchInput;
