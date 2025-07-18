# Environment Setup

## GitHub Token Configuration

To enable fetching of private repositories, you need to set up a GitHub personal access token:

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Click "Generate new token (classic)"
3. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `read:user` (Read access to profile data)
4. Copy the generated token
5. Create a `.env.local` file in the project root
6. Add your token:
   ```
   NEXT_PUBLIC_GITHUB_TOKEN=your_token_here
   ```

## Security Notes

- The token is prefixed with `NEXT_PUBLIC_` to make it available in the browser
- For production, consider implementing a server-side API route to keep the token secure
- Never commit your `.env.local` file to version control
- The `.gitignore` file already excludes environment files

## Fallback Behavior

If no token is provided, the portfolio will still work but will only show public repositories.
