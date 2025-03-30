export default function Home() {
  return (
    <form
        action="http://localhost:3000/exam/upload"
        method="POST"
        encType="multipart/form-data"
    >
        <input type="file" name="file" />
        <button type="submit">Upload</button>
    </form>
  );
}
