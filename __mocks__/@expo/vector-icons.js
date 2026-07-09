// Simplified mock for @expo/vector-icons - returns null elements
// Tests should query by accessibilityLabel, not by icon content
const React = require('react');

function createIconComponent(displayName) {
  const Component = React.forwardRef(function Icon(props, ref) {
    return null;
  });
  Component.displayName = displayName;
  return Component;
}

module.exports = {
  Feather: createIconComponent('Feather'),
  MaterialCommunityIcons: createIconComponent('MaterialCommunityIcons'),
  Ionicons: createIconComponent('Ionicons'),
  FontAwesome: createIconComponent('FontAwesome'),
};
