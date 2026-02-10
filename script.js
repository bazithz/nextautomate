// AI Magic Button for Contact Form
document.addEventListener('DOMContentLoaded', function() {
  const textarea = document.getElementById('messageTextarea');
  const generateBtn = document.getElementById('aiGenerateBtn');
  const generateBtnText = document.getElementById('generateBtnText');
  
  if (!textarea || !generateBtn) {
    console.error('Required elements not found');
    return;
  }
  
  // Show/hide button based on textarea content
  textarea.addEventListener('input', function() {
    const text = textarea.value.trim();
    // Show button if text is between 3-50 characters (short description)
    if (text.length >= 3 && text.length <= 50) {
      generateBtn.classList.remove('hidden');
    } else {
      generateBtn.classList.add('hidden');
    }
  });
  
  // Handle AI generation
  generateBtn.addEventListener('click', async function() {
    const userInput = textarea.value.trim();
    
    if (!userInput) {
      showError('Please enter a brief description first');
      return;
    }
    
    // Show loading state
    const originalText = generateBtnText.textContent;
    generateBtnText.textContent = 'Generating...';
    generateBtn.disabled = true;
    generateBtn.classList.add('opacity-75', 'cursor-not-allowed');
    
    // Disable textarea during generation
    textarea.disabled = true;
    textarea.classList.add('opacity-50');
    
    try {
      // Call your Netlify function
      const response = await fetch('/.netlify/functions/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userInput
        })
      });
      
      // Check if response is ok
      if (!response.ok) {
        let errorMessage = 'Failed to generate text';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If JSON parsing fails, use status text
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // Insert generated text into textarea with smooth transition
      textarea.value = data.generatedText;
      
      // Hide the button after successful generation
      generateBtn.classList.add('hidden');
      
      // Show success feedback with green border
      textarea.classList.add('border-green-500/50');
      setTimeout(() => {
        textarea.classList.remove('border-green-500/50');
      }, 3000);
      
      // Show success message
      showSuccess('✨ AI generated your detailed description!');
      
    } catch (error) {
      console.error('Error:', error);
      showError(error.message || 'Failed to generate text. Please try again.');
      
      // Reset button visibility on error
      if (textarea.value.trim().length >= 3 && textarea.value.trim().length <= 50) {
        generateBtn.classList.remove('hidden');
      }
    } finally {
      // Reset button state
      generateBtnText.textContent = originalText;
      generateBtn.disabled = false;
      generateBtn.classList.remove('opacity-75', 'cursor-not-allowed');
      
      // Re-enable textarea
      textarea.disabled = false;
      textarea.classList.remove('opacity-50');
    }
  });
  
  // Helper function to show success message
  function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
      const messageP = successDiv.querySelector('p');
      if (messageP) messageP.textContent = message;
      successDiv.classList.remove('hidden');
      setTimeout(() => {
        successDiv.classList.add('hidden');
      }, 5000);
    }
  }
  
  // Helper function to show error message
  function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    if (errorDiv && errorText) {
      errorText.textContent = '✗ ' + message;
      errorDiv.classList.remove('hidden');
      setTimeout(() => {
        errorDiv.classList.add('hidden');
      }, 5000);
    }
  }
});