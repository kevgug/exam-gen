export default function Home() {
  return (
    <form
      action="http://localhost:3000/exam/upload"
      method="POST"
      encType="multipart/form-data"
    >
      <div className="rounded-md border w-fit p-2">
        <input type="file" name="file" class="" />
        <button type="submit">Upload</button>
      </div>
    </form>
  );
}
