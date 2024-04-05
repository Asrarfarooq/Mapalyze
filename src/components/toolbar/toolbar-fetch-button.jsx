import React, { useState } from "react"; // Import useState
import PropTypes from "prop-types";
import {
  FaCloudDownloadAlt as IconFetch,
  FaSpinner as IconSpinner,
} from "react-icons/fa"; // Import spinner icon
import ToolbarButton from "./toolbar-button";

export default function ToolbarFetchButton(
  { state },
  { translator, projectActions }
) {
  const [isLoading, setIsLoading] = useState(false);

  let fetchAndLoadProject = () => {
    setIsLoading(true); // Start loading
    // Use fetch to get project data from the server
    fetch('http://localhost:4000/process-projects')
      .then(response => {
        setIsLoading(false); // Stop loading on response
        // Check if the fetch request was successful
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // Parse JSON response body
      })
      .then(data => {
        // Assuming 'data' contains the generated project data
        // and matches the structure expected by loadProject
        projectActions.loadProject(data);
      })
      .catch(error => {
        setIsLoading(false); // Stop loading on error
        // Log or handle errors in fetching or processing the data
        console.error('Error fetching and loading project:', error);
      });
  };
  return (
    <ToolbarButton
      active={isLoading} // Button appears active (pressed) when loading
      tooltip={translator.t("Fetch and generate")}
      onClick={fetchAndLoadProject}
    >
      {isLoading ? <IconSpinner className="animate-spin" /> : <IconFetch />}
      {/* Display spinner icon when loading, else display fetch icon */}
    </ToolbarButton>
  );
}

ToolbarFetchButton.propTypes = {
  state: PropTypes.object.isRequired,
};

ToolbarFetchButton.contextTypes = {
  projectActions: PropTypes.object.isRequired,
  translator: PropTypes.object.isRequired,
};
