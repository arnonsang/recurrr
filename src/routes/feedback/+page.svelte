<script lang="ts">
    // Email for contact
    const contactEmail = "hello@jlrlab.me";
</script>

<div class="feedback-container">
    <h1>Contact Us</h1>
    <p class="subtitle">We'd love to hear from you!</p>
    
    <div class="contact-info">
        <p>For any questions, suggestions or feedback, please email us at:</p>
        <a href="mailto:{contactEmail}" class="email-link">{contactEmail}</a>
        <button class="btn" on:click={() => window.location.href = `mailto:${contactEmail}`}>
            Send Email
        </button>
    </div>
</div>

<style>
    .feedback-container {
        max-width: 600px;
        margin: 2rem auto;
        padding: 2rem;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        text-align: center;
    }
    
    h1 {
        color: #333;
        margin-bottom: 0.5rem;
    }
    
    .subtitle {
        color: #666;
        margin-bottom: 2rem;
    }
    
    .contact-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }
    
    .email-link {
        color: #6366f1;
        font-size: 1.2rem;
        font-weight: 500;
        text-decoration: none;
        transition: color 0.2s;
    }
    
    .email-link:hover {
        color: #4f46e5;
        text-decoration: underline;
    }
    
    .btn {
        padding: 0.75rem 1.5rem;
        background-color: #6366f1;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.2s;
        margin-top: 1rem;
    }
    
    .btn:hover {
        background-color: #4f46e5;
    }
</style>
