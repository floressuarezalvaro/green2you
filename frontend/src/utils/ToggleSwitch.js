const ToggleSwitch = ({ checked, onChange, name, id }) => {
  return (
    <div className="toggle-switch-container">
      <label className="toggle-switch">
        <input
          type="checkbox"
          className="toggle-switch-checkbox"
          name={name}
          id={id}
          checked={checked}
          onChange={onChange}
        />
        <span className="toggle-switch-label" />
      </label>
    </div>
  );
};

export default ToggleSwitch;
